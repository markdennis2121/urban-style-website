
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();
  const { profile, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) {
      // Still loading, don't make any authorization decisions yet
      return;
    }

    if (!isAuthenticated || !profile) {
      setIsAuthorized(false);
      return;
    }

    let hasPermission = false;

    // Case 1: A specific role is required
    if (requiredRole) {
      if (requiredRole === 'user') {
        // Any authenticated user is considered a 'user'
        hasPermission = true;
      } else if (requiredRole === 'admin') {
        // Admins and Super Admins can access admin routes
        hasPermission = ['admin', 'super_admin'].includes(profile.role);
      } else if (requiredRole === 'super_admin') {
        // Only Super Admins can access super_admin routes
        hasPermission = profile.role === 'super_admin';
      }
    }
    // Case 2: Role must be in the allowed list
    else if (allowedRoles) {
      hasPermission = allowedRoles.includes(profile.role);
    }
    // Case 3: No roles specified, just authentication is needed
    else {
      hasPermission = true;
    }

    setIsAuthorized(hasPermission);

  }, [profile, loading, isAuthenticated, requiredRole, allowedRoles]);

  // Show loading spinner while authentication is being determined
  if (loading || isAuthorized === null) {
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
