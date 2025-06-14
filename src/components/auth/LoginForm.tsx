
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validatePassword } from '@/lib/security';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  email: string;
  password: string;
  loading: boolean;
  rateLimited: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  loading,
  rateLimited,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordValidation = validatePassword(password);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="w-full h-12"
          disabled={loading || rateLimited}
        />
      </div>
      
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          className="w-full h-12 pr-12"
          minLength={6}
          disabled={loading || rateLimited}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {password && !passwordValidation.isValid && (
        <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md space-y-2">
          <p className="font-semibold">Password requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            {passwordValidation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        disabled={loading || rateLimited}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
