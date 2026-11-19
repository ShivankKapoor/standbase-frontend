import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';
import { LoginForm } from '../components/auth/LoginForm';
import { TotpForm } from '../components/auth/TotpForm';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { checkSession } from '../api/auth';
import { useAuthContext } from '../context/AuthContext';

// Survives a page reload (e.g. the browser reloading after you switch to your authenticator app).
// sessionStorage is per-tab and cleared when the tab closes.
const PRE_AUTH_KEY = 'pre_auth_token';

export function LoginPage() {
  const { setAuth } = useAuthContext();
  const navigate = useNavigate();
  const [preAuthToken, setPreAuthTokenState] = useState<string | null>(
    () => sessionStorage.getItem(PRE_AUTH_KEY),
  );

  function setPreAuthToken(token: string | null) {
    if (token) sessionStorage.setItem(PRE_AUTH_KEY, token);
    else sessionStorage.removeItem(PRE_AUTH_KEY);
    setPreAuthTokenState(token);
  }

  async function handleSuccess(token: string) {
    sessionStorage.removeItem(PRE_AUTH_KEY);
    localStorage.setItem('session_token', token);
    const session = await checkSession();
    setAuth(token, session.userName);
    navigate('/');
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm -mt-10 animate-fade-in space-y-6">
          <div className="flex flex-col items-center gap-3">
            <img src="/cal.svg" alt="Standbase" className="h-20 w-20" />
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Standbase</h1>
              <p className="text-sm text-muted-foreground">
                {preAuthToken ? 'Enter your authenticator code' : 'Sign in to your account'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            {preAuthToken ? (
              <TotpForm
                preAuthToken={preAuthToken}
                onSuccess={handleSuccess}
                onBack={(errorMsg) => {
                  setPreAuthToken(null);
                  if (errorMsg) toast.error(errorMsg);
                }}
              />
            ) : (
              <LoginForm
                onTotpRequired={setPreAuthToken}
                onSuccess={handleSuccess}
              />
            )}
          </div>
      </div>
      <Toaster richColors position="bottom-center" />
    </div>
  );
}
