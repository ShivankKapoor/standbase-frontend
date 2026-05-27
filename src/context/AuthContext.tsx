import { createContext, useContext, useEffect, useState } from 'react';
import { checkSession } from '../api/auth';

function normalizeUsername(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

interface AuthState {
  token: string | null;
  username: string | null;
  loading: boolean;
  setAuth: (token: string, username: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('session_token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    checkSession()
      .then((res) => setUsername(normalizeUsername(res.userName)))
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, []);

  function setAuth(newToken: string, newUsername: string) {
    localStorage.setItem('session_token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(normalizeUsername(newUsername));
  }

  function clearAuth() {
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ token, username, loading, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
