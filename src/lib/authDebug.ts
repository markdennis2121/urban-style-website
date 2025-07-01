
import { supabase } from '@/lib/supabase/client';

export const debugAuthState = async () => {
  console.log('=== AUTH DEBUG START ===');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session);
    console.log('Session error:', sessionError);
    
    if (session?.user) {
      console.log('Current user:', {
        id: session.user.id,
        email: session.user.email,
        metadata: session.user.user_metadata
      });
      
      // Try to fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      console.log('Profile data:', profile);
      console.log('Profile error:', profileError);
      
      // If profile fetch failed, try by email
      if (profileError) {
        const { data: altProfile, error: altError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        console.log('Alternative profile lookup:', altProfile);
        console.log('Alternative profile error:', altError);
      }
    }
    
    // Check all profiles in database (for debugging)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, email, role, username')
      .limit(10);
      
    console.log('All profiles (first 10):', allProfiles);
    console.log('All profiles error:', allProfilesError);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  console.log('=== AUTH DEBUG END ===');
};

// Auto-run debug when this module is imported in development
if (import.meta.env.DEV) {
  debugAuthState();
}
