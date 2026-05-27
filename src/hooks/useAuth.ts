import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { logout as apiLogout } from '../api/auth';

export function useAuth() {
  const { token, username, loading, setAuth, clearAuth } = useAuthContext();
  const navigate = useNavigate();

  async function logout() {
    try {
      await apiLogout();
    } catch {
      // clear locally even if the server request fails
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return { token, username, loading, setAuth, logout };
}
