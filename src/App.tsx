import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntryEditorPage } from './pages/EntryEditorPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthContext();
  if (loading) return null;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entry/:date"
        element={
          <ProtectedRoute>
            <EntryEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
