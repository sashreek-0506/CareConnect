import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Wraps a set of routes: redirects to /login if unauthenticated, and to a
// role-appropriate home if the user's role isn't in `allowedRoles`.
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
