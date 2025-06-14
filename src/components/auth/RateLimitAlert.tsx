
import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface RateLimitAlertProps {
  remainingTime: number;
}

const RateLimitAlert: React.FC<RateLimitAlertProps> = ({ remainingTime }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <div className="space-y-3">
        <p className="font-medium">Account temporarily locked due to too many failed attempts.</p>
        <Progress value={(15 - remainingTime) / 15 * 100} className="w-full" />
        <p className="text-sm">Unlocks in {remainingTime} minutes</p>
      </div>
    </Alert>
  );
};

export default RateLimitAlert;
