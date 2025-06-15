
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
      {/* Fixed label with consistent width */}
      <span className="text-sm font-medium text-muted-foreground w-12 text-right">
        {isAdminMode ? 'Admin' : 'User'}
      </span>
      
      {/* Toggle switch with slider design */}
      <label className="relative inline-block w-[60px] h-[34px] cursor-pointer">
        <input
          type="checkbox"
          checked={isAdminMode}
          onChange={toggleAdminMode}
          className="opacity-0 w-0 h-0"
        />
        <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-[34px] transition-all duration-400 ease-in-out ${
          isAdminMode ? 'bg-[#6b7280]' : 'bg-gray-300'
        } before:absolute before:content-[''] before:h-[26px] before:w-[26px] before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-400 before:ease-in-out before:rounded-full ${
          isAdminMode ? 'before:translate-x-[26px]' : 'before:translate-x-0'
        }`} />
      </label>
    </div>
  );
};

export default AdminModeToggle;
