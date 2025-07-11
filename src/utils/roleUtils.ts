export type UserRole = 'user' | 'admin' | 'superadmin' | 'super_admin';

export const isAdmin = (role?: UserRole | string | null): boolean => {
  if (!role) return false;
  return ['admin', 'superadmin', 'super_admin'].includes(role);
};

export const isSuperAdmin = (role?: UserRole | string | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'super_admin'].includes(role);
};

export const hasPermission = (userRole?: UserRole | string | null, requiredRole?: UserRole): boolean => {
  if (!userRole || !requiredRole) return false;
  
  const roleHierarchy: Record<string, number> = {
    'user': 1,
    'admin': 2,
    'superadmin': 3,
    'super_admin': 3 // Same level as superadmin for backward compatibility
  };
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

export const normalizeRole = (role?: UserRole | string | null): UserRole => {
  if (role === 'super_admin') return 'superadmin';
  if (['user', 'admin', 'superadmin'].includes(role as string)) return role as UserRole;
  return 'user';
};