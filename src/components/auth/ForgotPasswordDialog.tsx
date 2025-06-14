
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { validateEmail, authRateLimiter, sanitizeText } from '@/lib/security';
import { KeyRound } from 'lucide-react';

interface ForgotPasswordDialogProps {
  disabled?: boolean;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Sanitize and validate email
    const sanitizedEmail = sanitizeText(email);
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Check rate limiting for password reset
    if (!authRateLimiter.isAllowed(`reset_${sanitizedEmail}`)) {
      const remaining = authRateLimiter.getRemainingTime(`reset_${sanitizedEmail}`);
      setError(`Too many password reset attempts. Please try again in ${Math.ceil(remaining / 1000 / 60)} minutes.`);
      setLoading(false);
      return;
    }

    try {
      console.log('Sending password reset email to:', sanitizedEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset email sent! Please check your inbox and follow the instructions.');
      
      // Close dialog after a delay
      setTimeout(() => {
        setOpen(false);
        setEmail('');
        setMessage(null);
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-primary hover:text-primary/80 font-medium"
          disabled={disabled}
        >
          <KeyRound className="h-4 w-4 mr-2" />
          Forgot your password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <span className="text-destructive-foreground font-medium">{error}</span>
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-600">
            <span className="font-medium">{message}</span>
          </Alert>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground mt-2">
              We'll send you a link to reset your password.
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
