import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearAuthError } from '../features/auth/authSlice';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match');
      return;
    }
    const result = await dispatch(register({ username: form.username.trim(), password: form.password }));
    if (register.fulfilled.match(result)) {
      navigate('/login', { replace: true, state: { registered: true } });
    }
  };

  const message = localError || error;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card shadow-sm w-100 auth-card">
        <div className="card-body p-4">
          <h2 className="h4 text-center fw-bold mb-4">Register</h2>

          {message && <div className="alert alert-danger py-2">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                autoComplete="username"
                minLength={3}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <PasswordInput
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm" className="form-label">Confirm password</label>
              <PasswordInput
                id="confirm"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            <Link to="/login" className="text-decoration-none">Already have an account? Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
