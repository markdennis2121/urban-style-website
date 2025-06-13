import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole, getCurrentProfile } from '@/lib/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const profile = await getCurrentProfile();
      
      if (profile && allowedRoles.includes(profile.role)) {
        setIsAuthorized(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
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
