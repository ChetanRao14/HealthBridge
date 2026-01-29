import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleLoginPage({ role, title, subtitle }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const storageKeys = useMemo(
    () => ({
      lastEmail: `hb_last_email_${role}`,
      emails: `hb_saved_emails_${role}`,
    }),
    [role]
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedEmails, setSavedEmails] = useState([]);

  useEffect(() => {
    try {
      const last = localStorage.getItem(storageKeys.lastEmail) || '';
      const listRaw = localStorage.getItem(storageKeys.emails) || '[]';
      const list = JSON.parse(listRaw);

      if (Array.isArray(list)) setSavedEmails(list.map(String).map((s) => s.trim()).filter(Boolean));
      if (last) setEmail(last);
    } catch (e) {
      setSavedEmails([]);
    }
  }, [storageKeys]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login({ role, email, password });

      try {
        const next = Array.from(new Set([email, ...savedEmails].map(String).map((s) => s.trim()).filter(Boolean))).slice(0, 8);
        localStorage.setItem(storageKeys.lastEmail, email);
        localStorage.setItem(storageKeys.emails, JSON.stringify(next));
      } catch (e) {
      }

      navigate(role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="hb-card p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="hb-card-title truncate">{title}</div>
          </div>
          {subtitle ? <div className="hb-muted mt-1 text-sm md:whitespace-nowrap">{subtitle}</div> : null}
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              className="hb-input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              list={`hb-email-suggestions-${role}`}
              type="email"
              required
              placeholder="name@example.com"
            />
            <datalist id={`hb-email-suggestions-${role}`}>
              {savedEmails.map((em) => (
                <option key={em} value={em} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-sm text-slate-700">Password</label>
            <input
              className="hb-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button type="submit" disabled={busy} className="hb-btn-primary w-full">
            {busy ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link className="hb-link" to="/login">Back</Link>
          {role !== 'admin' ? (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="hb-muted">New user?</div>
              <Link className="hb-link" to="/register">Create an account</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
