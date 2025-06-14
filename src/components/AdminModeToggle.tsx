
import React from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

const AdminModeToggle = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { isAdminMode, toggleAdminMode } = useAdminMode();

  // Only show for admin/super admin users
  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3 px-3 py-2 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl">
      <div className="flex items-center space-x-2">
        {isAdminMode ? (
          <ShieldCheck className="w-4 h-4 text-primary" />
        ) : (
          <ShoppingBag className="w-4 h-4 text-primary" />
        )}
        <Label 
          htmlFor="admin-mode-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          {isAdminMode ? 'Admin Mode' : 'Customer Mode'}
        </Label>
      </div>
      <Switch
        id="admin-mode-toggle"
        checked={isAdminMode}
        onCheckedChange={toggleAdminMode}
      />
    </div>
  );
};

export default AdminModeToggle;
