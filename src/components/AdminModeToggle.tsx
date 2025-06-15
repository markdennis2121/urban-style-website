
import React from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/hooks/useAuth';

const AdminModeToggle = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  // Only show for admin/super admin users
  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Fixed label */}
      <span className="text-sm font-medium text-muted-foreground min-w-[32px]">
        {isAdminMode ? 'Admin' : 'User'}
      </span>
      
      {/* Toggle switch */}
      <button
        onClick={toggleAdminMode}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:ring-offset-2 hover:bg-muted/40"
        role="switch"
        aria-checked={isAdminMode}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
            isAdminMode ? 'translate-x-6 bg-[#6b7280]' : 'translate-x-1'
          }`}
        />
        
        {/* Background color transition */}
        <span
          className={`absolute inset-0 rounded-full transition-colors duration-200 ${
            isAdminMode ? 'bg-[#6b7280]/20' : 'bg-muted/10'
          }`}
        />
      </button>
    </div>
  );
};

export default AdminModeToggle;
