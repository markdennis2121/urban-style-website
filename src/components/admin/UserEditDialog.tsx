
import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import type { User } from '@/hooks/useAdminData';

type EditUserProps = {
  user: User;
  open: boolean;
  onClose: () => void;
  onSubmit: (updates: Partial<User>) => Promise<void>;
}

const UserEditDialog: React.FC<EditUserProps> = ({ user, open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name ?? '',
    email: user.email ?? '',
    role: user.role ?? 'user',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Change user's profile details and role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Full Name</label>
            <Input name="full_name" value={formData.full_name} onChange={handleInput} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <Input name="email" value={formData.email} onChange={handleInput} type="email" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Role</label>
            <select
              className="border rounded px-2 py-1 w-full"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
