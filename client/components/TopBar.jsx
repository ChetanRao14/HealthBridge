import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-slate-900">HealthBridge</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <span className="hb-pill">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="hb-btn-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hb-btn-secondary" to="/login">Login</Link>
              <Link className="hb-btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
