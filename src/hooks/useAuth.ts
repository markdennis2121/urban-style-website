
import { useState, useEffect } from 'react';
import { getCurrentProfile, Profile } from '@/lib/supabase/client';

export const useAuth = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const userProfile = await getCurrentProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Error getting profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  return {
    profile,
    loading,
    isAuthenticated: !!profile,
    isSuperAdmin: profile?.role === 'super_admin',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  };
};
