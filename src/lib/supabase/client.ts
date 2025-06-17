
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'admin' | 'super_admin';

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
      throw userError;
    }
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('User found, fetching profile for:', user.email);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      
      // If profile doesn't exist, try to create it
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email || '',
              username: user.email?.split('@')[0] || 'user',
              role: 'user' as UserRole
            }
          ])
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        console.log('Profile created successfully:', newProfile);
        return newProfile;
      }
      
      throw profileError;
    }

    console.log('Profile fetched successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    throw error; // Re-throw to allow proper error handling upstream
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
