
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'admin' | 'super_admin' | 'superadmin';

export interface Profile {
  id: string;
  username: string | null;
  email: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const getCurrentProfile = async (): Promise<Profile | null> => {
  try {
    console.log('Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('User found, fetching profile for:', user.email);
    
    // Try multiple approaches to get profile data
    let profile = null;
    let profileError = null;
    
    // Attempt 1: Standard query
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      profile = data;
      console.log('Profile fetched via standard query:', profile);
    } catch (err) {
      profileError = err;
      console.log('Standard query failed, trying alternative approach:', err);
      
      // Attempt 2: If profile doesn't exist, create it
      if (err && (err as any).code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email || '',
                username: user.email?.split('@')[0] || 'user',
                role: 'user' as UserRole,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null
              }
            ])
            .select('*')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            // If creation fails due to RLS, try upsert
            const { data: upsertProfile, error: upsertError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: user.id,
                  email: user.email || '',
                  username: user.email?.split('@')[0] || 'user',
                  role: 'user' as UserRole,
                  full_name: user.user_metadata?.full_name || null,
                  avatar_url: user.user_metadata?.avatar_url || null
                }
              ], { onConflict: 'id' })
              .select('*')
              .single();
              
            if (upsertError) {
              console.error('Upsert also failed:', upsertError);
              // Return a basic profile structure if all else fails
              return {
                id: user.id,
                email: user.email || '',
                username: user.email?.split('@')[0] || 'user',
                role: 'user' as UserRole,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            
            profile = upsertProfile;
          } else {
            profile = newProfile;
          }
          
          console.log('Profile created successfully:', profile);
        } catch (createErr) {
          console.error('Failed to create profile:', createErr);
          // Return basic profile if creation fails
          return {
            id: user.id,
            email: user.email || '',
            username: user.email?.split('@')[0] || 'user',
            role: 'user' as UserRole,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      } else {
        // For other errors, try to return a basic profile
        console.log('Returning fallback profile due to:', err);
        return {
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || 'user',
          role: 'user' as UserRole,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    }

    return profile;
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    return null;
  }
};

export const hasRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
  try {
    const profile = await getCurrentProfile();
    return profile ? requiredRoles.includes(profile.role) : false;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};
