
import React from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, User } from 'lucide-react';

const AdminModeToggle = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  // Only show for admin/super admin users
  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <button
      onClick={toggleAdminMode}
      className="group flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-muted/20 border border-transparent hover:border-border/20 rounded-full transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center gap-1.5">
        <div className={`transition-all duration-500 ease-out ${
          isAdminMode 
            ? 'text-blue-600 rotate-0 scale-100' 
            : 'text-muted-foreground/60 rotate-12 scale-90'
        }`}>
          {isAdminMode ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
        <span className={`text-sm font-medium transition-all duration-300 ease-out ${
          isAdminMode 
            ? 'text-blue-700 translate-x-0' 
            : 'text-muted-foreground/70 translate-x-0.5'
        }`}>
          {isAdminMode ? 'Admin' : 'User'}
        </span>
      </div>
      
      {/* Custom toggle indicator */}
      <div className="relative w-8 h-4 bg-muted/30 rounded-full overflow-hidden transition-all duration-300 ease-out group-hover:bg-muted/40">
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-500 ease-out ${
          isAdminMode 
            ? 'left-4 bg-blue-500 shadow-blue-200' 
            : 'left-0.5 bg-muted-foreground/60 shadow-gray-200'
        }`} />
        {/* Smooth background transition */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${
          isAdminMode 
            ? 'bg-blue-100/50 scale-100' 
            : 'bg-muted/20 scale-95'
        }`} />
      </div>
    </button>
  );
};

export default AdminModeToggle;
