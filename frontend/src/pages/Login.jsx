import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../features/auth/authSlice';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username: form.username.trim(), password: form.password }));
    if (login.fulfilled.match(result)) {
      const user = result.payload.user;
      const from = location.state?.from;
      const fallback = user.admin ? '/admin' : '/dashboard';
      // Only go back to the page the user wanted if it matches their role
      const canGoBack = from && from.startsWith(user.admin ? '/admin' : '/dashboard');
      navigate(canGoBack ? from : fallback, { replace: true });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card shadow-sm w-100 auth-card">
        <div className="card-body p-4">
          <h2 className="h4 text-center fw-bold mb-4">Login</h2>

          {location.state?.registered && (
            <div className="alert alert-success py-2">Account created. Please log in.</div>
          )}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <PasswordInput
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={status === 'loading'}>
              {status === 'loading' ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            <Link to="/register" className="text-decoration-none">Don't have an account? Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
