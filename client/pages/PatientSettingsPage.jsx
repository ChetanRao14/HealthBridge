import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { City, Country, State } from 'country-state-city';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { useAuth } from '../context/AuthContext.jsx';
import { DobInput } from '../components/DobInput.jsx';

export default function PatientSettingsPage() {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth();

  const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms'];

  const [me, setMe] = useState(null);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [locationCountry, setLocationCountry] = useState('IN');
  const [locationState, setLocationState] = useState('');
  const [locationCity, setLocationCity] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  const load = async () => {
    const res = await api.get('/patients/me');
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

      await api.post('/patients/me/password', { currentPassword: pwCurrent, newPassword: pwNext });
      await logout();
      navigate('/login/patient');
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
    setTitle(String(me.title || ''));
    setName(String(me.name || ''));
    setEmail(String(me.email || ''));
    const parsed = parsePhoneNumberFromString(String(me.phone || ''));
    if (parsed) {
      setPhoneCountry(String(parsed.country || 'IN'));
      setPhoneNumber(String(parsed.nationalNumber || ''));
    } else {
      setPhoneCountry('IN');
      setPhoneNumber(String(me.phone || ''));
    }
    setGender(String(me.gender || 'prefer_not_to_say'));
    setDob(me.dob ? String(me.dob).slice(0, 10) : '');
    setAge(typeof me.age === 'number' ? String(me.age) : me.age ? String(me.age) : '');
    setLocationCountry(String(me.locationCountry || 'IN').trim().toUpperCase() || 'IN');
    setLocationState(String(me.locationState || ''));
    setLocationCity(String(me.locationCity || me.location || ''));
  }, [me]);

  const locationCountryOptions = useMemo(() => {
    const list = Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const locationStateOptions = useMemo(() => {
    if (!locationCountry) return [];
    const list = State.getStatesOfCountry(locationCountry).map((s) => ({ code: s.isoCode, name: s.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [locationCountry]);

  const selectedLocationStateCode = useMemo(() => {
    const match = locationStateOptions.find((s) => String(s.name) === String(locationState));
    return match ? match.code : '';
  }, [locationStateOptions, locationState]);

  const locationCityOptions = useMemo(() => {
    if (!locationCountry || !selectedLocationStateCode) return [];
    const list = City.getCitiesOfState(locationCountry, selectedLocationStateCode).map((c) => c.name);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [locationCountry, selectedLocationStateCode]);

  const regionNames = (() => {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      return null;
    }
  })();

  const countryOptions = (() => {
    const list = getCountries().map((c) => {
      const name = regionNames?.of(c) || c;
      const code = getCountryCallingCode(c);
      return { country: c, label: `${name} (+${code})` };
    });
    return list.sort((a, b) => a.label.localeCompare(b.label));
  })();

  useEffect(() => {
    if (!locationCountry) {
      if (locationState) setLocationState('');
      if (locationCity) setLocationCity('');
      return;
    }

    if (locationState && !locationStateOptions.some((s) => String(s.name) === String(locationState))) {
      setLocationState('');
      setLocationCity('');
    }
  }, [locationCountry, locationState, locationStateOptions]);

  useEffect(() => {
    if (!locationCountry || !locationState) {
      if (locationCity) setLocationCity('');
      return;
    }

    if (locationCity && !locationCityOptions.includes(locationCity)) {
      setLocationCity('');
    }
  }, [locationCountry, locationState, locationCity, locationCityOptions]);

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
      const cc = phoneCountry ? `+${getCountryCallingCode(phoneCountry)}` : '';
      const nextPhone = String(phoneNumber || '').trim();

      const payload = {
        title,
        name,
        email,
        phone: nextPhone ? `${cc} ${nextPhone}`.trim() : '',
        gender,
        dob: dob || null,
        age: age === '' ? undefined : Number(age),
        locationCountry,
        locationState,
        locationCity,
      };
      const res = await api.put('/patients/me', payload);
      setMe(res.data);
      updateUser({ email: res.data?.email, name: res.data?.name });
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
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/patient')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6">
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Title</label>
            <select className="hb-input mt-1" value={title} onChange={(e) => setTitle(e.target.value)}>
              <option value="">Select</option>
              {TITLE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Name</label>
            <input className="hb-input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm text-slate-700">Email</label>
            <input className="hb-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <label className="text-sm text-slate-700">Phone</label>
            <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="hb-input" value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)}>
                {countryOptions.map((o) => (
                  <option key={o.country} value={o.country}>{o.label}</option>
                ))}
              </select>
              <input
                className="hb-input md:col-span-2"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700">Gender</label>
            <select className="hb-input mt-1" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Date of Birth</label>
            <DobInput value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-slate-700">Age</label>
            <input className="hb-input mt-1" type="number" min="0" max="130" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" />
          </div>

          <div>
            <label className="text-sm text-slate-700">Country</label>
            <select
              className="hb-input mt-1"
              value={locationCountry}
              onChange={(e) => {
                setLocationCountry(e.target.value);
                setLocationState('');
                setLocationCity('');
              }}
            >
              <option value="">Select country</option>
              {locationCountryOptions.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">State</label>
            <select
              className="hb-input mt-1"
              value={locationState}
              onChange={(e) => {
                setLocationState(e.target.value);
                setLocationCity('');
              }}
              disabled={!locationCountry}
            >
              <option value="">Select state</option>
              {locationStateOptions.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">City</label>
            <select className="hb-input mt-1" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} disabled={!locationCountry || !locationState}>
              <option value="">Select city</option>
              {locationCityOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link className="hb-link" to="/patient">Back to Dashboard</Link>
            <button disabled={saving} className="hb-btn-primary" type="submit">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {success ? <div className="text-sm text-emerald-700">{success}</div> : null}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
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
