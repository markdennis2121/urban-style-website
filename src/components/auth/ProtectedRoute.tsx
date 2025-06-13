import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole, getCurrentProfile } from '@/lib/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentProfile();
        
        if (profile) {
          if (!requiredRole) {
            // If no specific role is required, just need to be logged in
            setIsAuthorized(true);
          } else if (requiredRole === 'super_admin' && profile.role === 'super_admin') {
            // Super admin can access super admin routes
            setIsAuthorized(true);
          } else if (requiredRole === 'admin' && ['admin', 'super_admin'].includes(profile.role)) {
            // Admin and super admin can access admin routes
            setIsAuthorized(true);
          } else if (requiredRole === 'user') {
            // Any authenticated user can access user routes
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to appropriate login page based on the attempted access
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
