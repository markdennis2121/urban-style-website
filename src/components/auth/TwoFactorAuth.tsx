
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Shield, Smartphone, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import QRCode from 'qrcode';

interface TwoFactorAuthProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ userId, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateTwoFactorSecret();
  }, []);

  const generateTwoFactorSecret = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-2fa-secret', {
        body: { userId }
      });

      if (error) throw error;

      setSecret(data.secret);
      const qrCodeUrl = await QRCode.toDataURL(data.qrCodeUrl);
      setQrCode(qrCodeUrl);
    } catch (err) {
      setError('Failed to generate 2FA secret');
    }
  };

  const verifyAndEnable2FA = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-setup', {
        body: { userId, secret, token: verificationCode }
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
          <Shield className="h-5 w-5 text-green-600" />
          Enable Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </Alert>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
              {qrCode && (
                <img src={qrCode} alt="2FA QR Code" className="mx-auto border rounded" />
              )}
            </div>
            
            <div className="bg-muted p-3 rounded text-center">
              <p className="text-xs text-muted-foreground mb-1">Manual entry key:</p>
              <code className="text-sm font-mono">{secret}</code>
            </div>

            <Button 
              onClick={() => setStep('verify')} 
              className="w-full"
              disabled={!secret}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              I've Added the Account
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
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
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={verifyAndEnable2FA}
                disabled={verificationCode.length !== 6 || loading}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
