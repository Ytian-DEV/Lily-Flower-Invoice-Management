import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { BrandLogo } from '@/components/layout/BrandMark';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface LocationState {
  from?: { pathname?: string; search?: string };
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (/invalid login credentials/i.test(message)) {
    return 'That email and password do not match.';
  }

  if (/fetch|network/i.test(message)) {
    return 'Cannot reach the server. Check the internet connection.';
  }

  return message || 'Sign-in failed. Please try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from;
  const redirectTo = from?.pathname
    ? `${from.pathname}${from.search ?? ''}`
    : '/dashboard';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(friendlyError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="size-14 rounded-xl" />
          <h1 className="mt-4 font-heading text-2xl font-medium text-text">
            Lily Flowers
          </h1>
          <p className="mt-1 text-sm text-muted">Baybay City · Orders and invoices</p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-card">
          {errorMessage ? (
            <Alert variant="error" description={errorMessage} className="mb-4" />
          ) : null}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              label="Email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              trailingSlot={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </Button>
              }
            />
            <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Forgot your password? Ask the shop admin to reset it.
        </p>
      </div>
    </main>
  );
}
