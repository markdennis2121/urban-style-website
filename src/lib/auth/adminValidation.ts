
import { supabase } from '@/lib/supabase/client';

export interface AdminValidationResult {
  isValid: boolean;
  role: string | null;
  error?: string;
}

export const validateAdminAccess = async (requiredRoles: string[] = ['admin', 'super_admin']): Promise<AdminValidationResult> => {
  try {
    // Get current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        isValid: false,
        role: null,
        error: 'Session validation failed'
      };
    }

    if (!session?.user) {
      return {
        isValid: false,
        role: null,
        error: 'No authenticated user'
      };
    }

    // Get user profile with role from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      return {
        isValid: false,
        role: null,
        error: 'Failed to fetch user profile'
      };
    }

    const userRole = profile?.role || 'user';
    const hasRequiredRole = requiredRoles.includes(userRole);

    return {
      isValid: hasRequiredRole,
      role: userRole,
      error: hasRequiredRole ? undefined : 'Insufficient privileges'
    };

  } catch (error) {
    return {
      isValid: false,
      role: null,
      error: 'Admin validation failed'
    };
  }
};

export const validateSuperAdminAccess = async (): Promise<AdminValidationResult> => {
  return validateAdminAccess(['super_admin']);
};

export const validateAnyAdminAccess = async (): Promise<AdminValidationResult> => {
  return validateAdminAccess(['admin', 'super_admin']);
};
