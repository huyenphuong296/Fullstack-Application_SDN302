import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function DashboardLayout({ title, links }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="container py-4">
      <header className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="display-5 fw-semibold mb-0">{title}</h1>
        <span className="fs-5">Welcome, {user?.username}</span>
      </header>

      <nav className="navbar navbar-expand-md bg-body-tertiary rounded px-3 mb-4">
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${open ? ' show' : ''}`}>
          <ul className="navbar-nav">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink to={link.to} end={link.end} className="nav-link" onClick={() => setOpen(false)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
