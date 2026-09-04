import { Navigate, Route, Routes } from 'react-router';
import { useAuthContext } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntryEditorPage } from './pages/EntryEditorPage';
import { TodoEditorPage } from './pages/TodoEditorPage';
import { PresentEntryPage } from './pages/PresentEntryPage';
import { StatsPage } from './pages/StatsPage';

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
      <Route
        path="/entry/:date/present"
        element={
          <ProtectedRoute>
            <PresentEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/todos/:date"
        element={
          <ProtectedRoute>
            <TodoEditorPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
