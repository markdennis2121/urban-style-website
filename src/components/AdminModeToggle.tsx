
import React from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, User } from 'lucide-react';

const AdminModeToggle = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  // Only show for admin/super admin users
  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-background/40 backdrop-blur-sm border border-border/30 rounded-full transition-all duration-200 hover:bg-background/60 hover:border-border/50">
      <div className="flex items-center gap-1.5">
        <div className={`transition-all duration-300 ${isAdminMode ? 'text-amber-600 scale-110' : 'text-muted-foreground scale-100'}`}>
          {isAdminMode ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <User className="w-3.5 h-3.5" />
          )}
        </div>
        <span className={`text-xs font-medium transition-colors duration-200 ${
          isAdminMode ? 'text-amber-700' : 'text-muted-foreground'
        }`}>
          {isAdminMode ? 'Admin' : 'User'}
        </span>
      </div>
      <Switch
        checked={isAdminMode}
        onCheckedChange={toggleAdminMode}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-muted scale-75"
      />
    </div>
  );
};

export default AdminModeToggle;
