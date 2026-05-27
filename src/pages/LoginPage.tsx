import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { TotpForm } from '../components/auth/TotpForm';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { checkSession } from '../api/auth';
import { useAuthContext } from '../context/AuthContext';

export function LoginPage() {
  const { setAuth } = useAuthContext();
  const navigate = useNavigate();
  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);

  async function handleSuccess(token: string) {
    localStorage.setItem('session_token', token);
    const session = await checkSession();
    setAuth(token, session.userName);
    navigate('/');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Standbase</h1>
              <p className="text-sm text-muted-foreground">
                {preAuthToken ? 'Enter your authenticator code' : 'Sign in to your account'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {preAuthToken ? (
              <TotpForm
                preAuthToken={preAuthToken}
                onSuccess={handleSuccess}
                onBack={() => setPreAuthToken(null)}
              />
            ) : (
              <LoginForm
                onTotpRequired={setPreAuthToken}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
