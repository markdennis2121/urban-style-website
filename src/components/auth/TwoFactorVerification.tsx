
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface TwoFactorVerificationProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({ 
  userId, 
  onSuccess, 
  onCancel 
}) => {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-login', {
        body: { userId, token: verificationCode }
      });

      if (error) throw error;

      if (data.verified) {
        onSuccess();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </Alert>
        )}

        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
        
        <Input
          type="text"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center text-lg tracking-widest"
          maxLength={6}
          autoFocus
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={verifyCode}
            disabled={verificationCode.length !== 6 || loading}
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorVerification;
