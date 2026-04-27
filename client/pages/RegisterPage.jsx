import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { City, Country, State } from 'country-state-city';
import { DobInput } from '../components/DobInput.jsx';

const SPECIALIZATION_OPTIONS = [
  'Anesthesiologist',
  'Cardiologist',
  'Dermatologist',
  'Dentist',
  'Endocrinologist',
  'ENT',
  'Gastroenterologist',
  'General Physician',
  'General Surgeon',
  'Gynecologist',
  'Hematologist',
  'Nephrologist',
  'Neurologist',
  'Neurosurgeon',
  'Ophthalmologist',
  'Oncologist',
  'Orthopedic',
  'Pediatrician',
  'Physiotherapist',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Rheumatologist',
  'Urologist',
];

const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Mx'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');

  const [locationCountry, setLocationCountry] = useState('IN');
  const [locationState, setLocationState] = useState('');
  const [locationCity, setLocationCity] = useState('');

  const [hospitalCountry, setHospitalCountry] = useState('IN');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalCity, setHospitalCity] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');

  const [specialization, setSpecialization] = useState('General Physician');
  const [customSpecializationEnabled, setCustomSpecializationEnabled] = useState(false);
  const [experienceYears, setExperienceYears] = useState('');
  const [consultationFees, setConsultationFees] = useState('');

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const specializationSelectValue = customSpecializationEnabled ? '__custom__' : specialization;

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

  const hospitalCountryOptions = locationCountryOptions;
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

  useEffect(() => {
    if (role === 'patient') return;
    if (!specialization) setSpecialization('General Physician');
  }, [role, specialization]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await register({
        role,
        title,
        name,
        email,
        phone,
        gender,
        dob: dob || null,
        age: age === '' ? undefined : Number(age),
        locationCountry,
        locationState,
        locationCity,
        clinicCountry: hospitalCountry,
        clinicState: hospitalState,
        clinicCity: hospitalCity,
        clinicAddress: hospitalAddress,
        specialization,
        experienceYears: experienceYears === '' ? undefined : Number(experienceYears),
        consultationFees: consultationFees === '' ? undefined : Number(consultationFees),
        password,
      });
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="hb-card p-6">
        <div className="hb-card-title">Register</div>
        <div className="hb-muted mt-1">Create your HealthBridge account.</div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-slate-700">Account Type</label>
            <select
              className="hb-input mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

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
            <input
              className="hb-input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div>
            <label className="text-sm text-slate-700">Phone</label>
            <input
              className="hb-input mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-700">Date of Birth</label>
              <DobInput value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Age</label>
              <input className="hb-input mt-1" type="number" min="0" max="130" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" onWheel={(e) => e.target.blur()} />
            </div>
          </div>

          {role === 'patient' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-700">Specialization</label>
                <select
                  className="hb-input mt-1"
                  value={specializationSelectValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '__custom__') {
                      setCustomSpecializationEnabled(true);
                      setSpecialization((prev) => (SPECIALIZATION_OPTIONS.includes(String(prev || '').trim()) ? '' : prev));
                    } else {
                      setCustomSpecializationEnabled(false);
                      setSpecialization(v);
                    }
                  }}
                  required
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATION_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__custom__">Custom</option>
                </select>
                {customSpecializationEnabled ? (
                  <input
                    className="hb-input mt-2"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Type specialization"
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-700">Experience (years)</label>
                  <input className="hb-input mt-1" type="number" min="0" max="80" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="Optional" onWheel={(e) => e.target.blur()} />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Consultation Fees</label>
                  <input className="hb-input mt-1" type="number" min="0" value={consultationFees} onChange={(e) => setConsultationFees(e.target.value)} placeholder="Optional" onWheel={(e) => e.target.blur()} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              </div>

              <div>
                <label className="text-sm text-slate-700">Hospital Address</label>
                <input className="hb-input mt-1" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} placeholder="Hospital/Clinic address" />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-700">Password</label>
            <input
              className="hb-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            type="submit"
            disabled={busy}
            className="hb-btn-primary w-full"
          >
            {busy ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="text-sm text-slate-700 mt-4">
          Already have an account? <Link className="hb-link" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
