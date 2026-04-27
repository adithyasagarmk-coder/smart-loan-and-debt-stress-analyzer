import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/auth/login'); };
  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/loans',     label: 'My Loans'  },
    { to: '/simulation',label: 'Simulation'},
    { to: '/analysis',  label: 'Stress Analysis' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <Link to="/dashboard" className="navbar-title">SmartLoan</Link>
        </div>

        {/* Nav links */}
        {user && (
          <div className="navbar-nav">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`navbar-link${isActive(l.to) ? ' active' : ''}`}>{l.label}</Link>
            ))}
          </div>
        )}

        {/* Actions */}
        {user && (
          <div className="navbar-actions">
            <span className="navbar-user">{user.name || user.email}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
