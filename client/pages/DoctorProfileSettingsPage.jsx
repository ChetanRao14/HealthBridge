import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { City, Country, State } from 'country-state-city';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import { useAuth } from '../context/AuthContext.jsx';
import { DobInput } from '../components/DobInput.jsx';

const TITLE_OPTIONS = ['Dr', 'Mr', 'Mrs', 'Ms', 'Mx'];

export default function DoctorProfileSettingsPage() {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth();

  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNext, setPwNext] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');

  const [title, setTitle] = useState('');
  const [customTitleEnabled, setCustomTitleEnabled] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [phoneCountry, setPhoneCountry] = useState('IN');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [gender, setGender] = useState('prefer_not_to_say');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');

  const [hospitalCountry, setHospitalCountry] = useState('IN');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalCity, setHospitalCity] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');

  const titleSelectValue = customTitleEnabled ? '__custom__' : title;

  useEffect(() => {
    const value = String(title || '').trim();
    if (!value) {
      if (customTitleEnabled) setCustomTitleEnabled(false);
      return;
    }
    const isCustom = !TITLE_OPTIONS.includes(value);
    if (customTitleEnabled !== isCustom) setCustomTitleEnabled(isCustom);
  }, [title, customTitleEnabled]);

  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      return null;
    }
  }, []);

  const phoneCountryOptions = useMemo(() => {
    const list = getCountries().map((c) => {
      const name = regionNames?.of(c) || c;
      const code = getCountryCallingCode(c);
      return { country: c, label: `${name} (+${code})` };
    });
    return list.sort((a, b) => a.label.localeCompare(b.label));
  }, [regionNames]);

  const hospitalCountryOptions = useMemo(() => {
    const list = Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const hospitalStateOptions = useMemo(() => {
    if (!hospitalCountry) return [];
    const list = State.getStatesOfCountry(hospitalCountry).map((s) => ({ code: s.isoCode, name: s.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [hospitalCountry]);

  const selectedHospitalStateCode = useMemo(() => {
    const match = hospitalStateOptions.find((s) => String(s.name) === String(hospitalState));
    return match ? match.code : '';
  }, [hospitalStateOptions, hospitalState]);

  const hospitalCityOptions = useMemo(() => {
    if (!hospitalCountry || !selectedHospitalStateCode) return [];
    const list = City.getCitiesOfState(hospitalCountry, selectedHospitalStateCode).map((c) => c.name);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [hospitalCountry, selectedHospitalStateCode]);

  const load = async () => {
    const res = await api.get('/doctor/me');
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

      await api.post('/doctor/me/password', { currentPassword: pwCurrent, newPassword: pwNext });
      await logout();
      navigate('/login/doctor');
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

    setHospitalCountry(String(me.clinicCountry || 'IN').trim().toUpperCase() || 'IN');
    setHospitalState(String(me.clinicState || ''));
    setHospitalCity(String(me.clinicCity || me.clinicLocation || ''));
    setHospitalAddress(String(me.clinicAddress || ''));
  }, [me]);

  useEffect(() => {
    if (!hospitalCountry) {
      if (hospitalState) setHospitalState('');
      if (hospitalCity) setHospitalCity('');
      return;
    }

    if (hospitalState && !hospitalStateOptions.some((s) => String(s.name) === String(hospitalState))) {
      setHospitalState('');
      setHospitalCity('');
    }
  }, [hospitalCountry, hospitalState, hospitalStateOptions]);

  useEffect(() => {
    if (!hospitalCountry || !hospitalState) {
      if (hospitalCity) setHospitalCity('');
      return;
    }

    if (hospitalCity && !hospitalCityOptions.includes(hospitalCity)) {
      setHospitalCity('');
    }
  }, [hospitalCountry, hospitalState, hospitalCity, hospitalCityOptions]);

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

      const res = await api.put('/doctor/me', {
        title,
        name,
        email,
        phone: nextPhone ? `${cc} ${nextPhone}`.trim() : '',
        gender,
        dob: dob || null,
        age: age === '' ? undefined : Number(age),
        clinicCountry: hospitalCountry,
        clinicState: hospitalState,
        clinicCity: hospitalCity,
        clinicAddress: hospitalAddress,
      });

      updateUser({ email: res.data?.email, name: res.data?.name });
      setSuccess('Saved');
      await load();
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
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/doctor')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6">
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Title</label>
            <select
              className="hb-input mt-1"
              value={titleSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') {
                  setCustomTitleEnabled(true);
                  setTitle((prev) => (TITLE_OPTIONS.includes(String(prev || '').trim()) ? '' : prev));
                } else {
                  setCustomTitleEnabled(false);
                  setTitle(v);
                }
              }}
            >
              <option value="">Select</option>
              {TITLE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__custom__">Custom</option>
            </select>
            {customTitleEnabled ? (
              <input className="hb-input mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Type title" />
            ) : null}
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
                {phoneCountryOptions.map((o) => (
                  <option key={o.country} value={o.country}>{o.label}</option>
                ))}
              </select>
              <input className="hb-input md:col-span-2" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number" />
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
            <label className="text-sm text-slate-700">Hospital Country</label>
            <select
              className="hb-input mt-1"
              value={hospitalCountry}
              onChange={(e) => {
                setHospitalCountry(e.target.value);
                setHospitalState('');
                setHospitalCity('');
              }}
            >
              <option value="">Select country</option>
              {hospitalCountryOptions.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Hospital State</label>
            <select
              className="hb-input mt-1"
              value={hospitalState}
              onChange={(e) => {
                setHospitalState(e.target.value);
                setHospitalCity('');
              }}
              disabled={!hospitalCountry}
            >
              <option value="">Select state</option>
              {hospitalStateOptions.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Hospital City</label>
            <select className="hb-input mt-1" value={hospitalCity} onChange={(e) => setHospitalCity(e.target.value)} disabled={!hospitalCountry || !hospitalState}>
              <option value="">Select city</option>
              {hospitalCityOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">Hospital Address</label>
            <input className="hb-input mt-1" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} placeholder="Hospital/Clinic address" />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="hb-btn-secondary" onClick={() => navigate('/doctor')}>
              Back
            </button>
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
