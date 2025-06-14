
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

    // Check if user has required specific role
    if (requiredRole) {
      if (requiredRole === 'super_admin' && profile.role === 'super_admin') {
        setIsAuthorized(true);
      } else if (requiredRole === 'admin' && ['admin', 'super_admin'].includes(profile.role)) {
        setIsAuthorized(true);
      } else if (requiredRole === 'user') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
    // Check if user has any of the allowed roles
    else if (allowedRoles && allowedRoles.includes(profile.role)) {
      setIsAuthorized(true);
    }
    // If no specific role requirements, just need to be logged in
    else if (!requiredRole && !allowedRoles) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
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
