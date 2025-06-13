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

// Helper function to get current user's profile with role
export const getCurrentProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error getting current profile:', error);
    return null;
  }
};

// Helper function to check if user has required role
export const hasRole = async (requiredRoles: UserRole[]): Promise<boolean> => {
  const profile = await getCurrentProfile();
  return profile ? requiredRoles.includes(profile.role) : false;
};
