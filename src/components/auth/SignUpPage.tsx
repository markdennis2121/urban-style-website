import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const MIN_USERNAME_LENGTH = 3;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (value: string) => {
    if (value.length < MIN_USERNAME_LENGTH) {
      return 'Username must be at least 3 characters long';
    }
    if (!USERNAME_REGEX.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!email || !password || !username) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Username validation
      const usernameError = validateUsername(username);
      if (usernameError) {
        throw new Error(usernameError);
      }

      console.log('Starting signup process with:', { email, username });

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username.toLowerCase(), // Store username in lowercase
          }
        }
      });

      if (error) {
        console.error('Signup error from Supabase:', error);
        throw error;
      }

      if (!data?.user) {
        throw new Error('Signup failed - no user data returned');
      }

      console.log('Signup successful:', data);

      // Redirect to login page with success message
      navigate('/login', {
        state: {
          message: 'Sign up successful! Please check your email to verify your account.'
        }
      });
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Database error')) {
          setError('Username may already be taken. Please try a different one.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    const error = validateUsername(value);
    if (error) {
      e.target.setCustomValidity(error);
    } else {
      e.target.setCustomValidity('');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username (letters, numbers, _ or -)"
              value={username}
              onChange={handleUsernameChange}
              required
              className="w-full"
              minLength={MIN_USERNAME_LENGTH}
              pattern="[a-zA-Z0-9_-]+"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            Already have an account? Login
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
