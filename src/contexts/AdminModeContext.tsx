
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  canUseShoppingFeatures: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export const useAdminMode = () => {
  const context = useContext(AdminModeContext);
  if (!context) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
};

export const AdminModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(true);

  // Load saved preference from localStorage
  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      const savedMode = localStorage.getItem('adminMode');
      if (savedMode !== null) {
        setIsAdminMode(savedMode === 'true');
      }
    }
  }, [isAdmin, isSuperAdmin]);

  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    localStorage.setItem('adminMode', newMode.toString());
  };

  // If user is not admin/super admin, they can always use shopping features
  const canUseShoppingFeatures = !(isAdmin || isSuperAdmin) || !isAdminMode;

  return (
    <AdminModeContext.Provider value={{
      isAdminMode,
      toggleAdminMode,
      canUseShoppingFeatures
    }}>
      {children}
    </AdminModeContext.Provider>
  );
};
