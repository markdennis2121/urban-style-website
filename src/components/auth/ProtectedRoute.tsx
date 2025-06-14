
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole, getCurrentProfile } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error in ProtectedRoute:', sessionError);
          if (mounted) {
            setIsAuthorized(false);
            setIsLoading(false);
          }
          return;
        }

        if (!session?.user) {
          console.log('No session found in ProtectedRoute');
          if (mounted) {
            setIsAuthorized(false);
            setIsLoading(false);
          }
          return;
        }

        // Get user profile
        const profile = await getCurrentProfile();
        
        if (profile && mounted) {
          // Check if user has required specific role
          if (requiredRole) {
            if (requiredRole === 'super_admin' && profile.role === 'super_admin') {
              setIsAuthorized(true);
            } else if (requiredRole === 'admin' && ['admin', 'super_admin'].includes(profile.role)) {
              setIsAuthorized(true);
            } else if (requiredRole === 'user') {
              setIsAuthorized(true);
            }
          }
          // Check if user has any of the allowed roles
          else if (allowedRoles && allowedRoles.includes(profile.role)) {
            setIsAuthorized(true);
          }
          // If no specific role requirements, just need to be logged in
          else if (!requiredRole && !allowedRoles) {
            setIsAuthorized(true);
          }
        } else if (mounted) {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Auth check error in ProtectedRoute:', error);
        if (mounted) {
          setIsAuthorized(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in ProtectedRoute:', event);
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setIsAuthorized(false);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-check auth when user signs in or token refreshes
        checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    const redirectPath = location.pathname.includes('superadmin') 
      ? '/superadmin/login'
      : location.pathname.includes('admin')
        ? '/admin/login'
        : '/login';
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
