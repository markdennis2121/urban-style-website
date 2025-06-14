
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalInfoFormProps {
  currentUser: any;
  username: string;
  fullName: string;
  phone: string;
  onUsernameChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

const PersonalInfoForm = ({
  currentUser,
  username,
  fullName,
  phone,
  onUsernameChange,
  onFullNameChange,
  onPhoneChange
}: PersonalInfoFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-foreground text-sm font-medium mb-2 block">
          Username
        </Label>
        <Input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter username"
          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label className="text-foreground text-sm font-medium mb-2 block">
          Full Name
        </Label>
        <Input
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          placeholder="Enter full name"
          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <Label className="text-foreground text-sm font-medium mb-2 block">
          Email
        </Label>
        <Input
          value={currentUser?.email}
          disabled
          className="bg-muted/30 border-border/30 text-muted-foreground"
        />
      </div>

      <div>
        <Label className="text-foreground text-sm font-medium mb-2 block">
          Phone Number
        </Label>
        <Input
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter phone number"
          className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
