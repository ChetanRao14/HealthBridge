import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminProfileSettingsPage() {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth();

  const [me, setMe] = useState(null);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  const load = async () => {
    const res = await api.get('/admin/me');
    setMe(res.data);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwBusy(true);

    try {
      if (!pwCurrent || !pwNext) {
        setPwError('Please fill all password fields');
        return;
      }
      if (pwNext.length < 6) {
        setPwError('Password must be at least 6 characters');
        return;
      }
      if (pwNext !== pwConfirm) {
        setPwError('New password and confirm password do not match');
        return;
      }

      await api.post('/admin/me/password', { currentPassword: pwCurrent, newPassword: pwNext });
      await logout();
      navigate('/login/admin');
    } catch (err) {
      setPwError(err?.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPwBusy(false);
    }
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load settings'));
  }, []);

  useEffect(() => {
    if (!me) return;
    setEmail(String(me.email || ''));
  }, [me]);

  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(t);
  }, [success]);

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/admin/me', { email });
      setMe(res.data);
      updateUser({ email: res.data?.email });
      setSuccess('Saved');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="hb-card-title">Profile Settings</div>
            <div className="hb-muted mt-1">Update your profile details.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/admin')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6">
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input
              className="hb-input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          {success ? <div className="text-sm text-emerald-700">{success}</div> : null}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex items-center justify-end gap-2">
            <button disabled={saving} className="hb-btn-primary" type="submit">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      <div className="hb-card p-6">
        <div className="hb-card-title">Change Password</div>
        <div className="hb-muted mt-1">You will be logged out after changing your password.</div>

        <form onSubmit={onChangePassword} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-700">Current Password</label>
            <input className="hb-input mt-1" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-slate-700">New Password</label>
            <input className="hb-input mt-1" type="password" value={pwNext} onChange={(e) => setPwNext(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-slate-700">Confirm New Password</label>
            <input className="hb-input mt-1" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} required />
          </div>

          {pwError ? <div className="text-sm text-red-600">{pwError}</div> : null}

          <div className="flex items-center justify-end gap-2">
            <button disabled={pwBusy} className="hb-btn-primary" type="submit">
              {pwBusy ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
