import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const homePath = (user) => {
  if (!user) return '/login';
  return user.admin ? '/admin' : '/dashboard';
};

// Logged-in normal users only (admins are sent to their own dashboard)
export function RequireAuth() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.admin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

// Admins only
export function RequireAdmin() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!user.admin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Login / register pages: already logged-in users go straight to their dashboard
export function GuestOnly() {
  const user = useSelector((state) => state.auth.user);
  if (user) return <Navigate to={homePath(user)} replace />;
  return <Outlet />;
}
