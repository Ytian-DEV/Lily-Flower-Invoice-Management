import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { LogoPlaceholder } from '@/components/layout/LogoPlaceholder';
import { Alert, Button, Card, CardBody, Checkbox, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to sign in. Please try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? '/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-text">
      <Card variant="elevated" className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="flex flex-col items-center text-center">
            <LogoPlaceholder />
            <h1 className="mt-5 font-heading text-3xl font-semibold">
              Lily Flowers - Baybay City Branch
            </h1>
            <p className="mt-2 text-sm text-muted">Welcome back. Sign in to continue.</p>
          </div>

          {errorMessage ? (
            <div className="mt-6">
              <Alert variant="error" title="Login failed" description={errorMessage} />
            </div>
          ) : null}

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leadingIcon={<Mail aria-hidden="true" className="size-5" />}
            />
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                leadingIcon={<Lock aria-hidden="true" className="size-5" />}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-8 min-h-10 px-3"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </Button>
            </div>
            <Checkbox
              id="remember-session"
              checked={rememberSession}
              onChange={(event) => setRememberSession(event.target.checked)}
              label="Remember current session"
              helperText="Supabase keeps browser sessions restored securely."
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
