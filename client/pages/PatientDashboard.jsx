import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { City, Country, State } from 'country-state-city';

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

export default function PatientDashboard() {
  const todayISO = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const [me, setMe] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ specialization: '', minExperience: '', availabilityDay: '' });
  const [booking, setBooking] = useState({ doctorId: '', date: '', timeSlot: '' });

  const [customSpecializationEnabled, setCustomSpecializationEnabled] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nowTick, setNowTick] = useState(Date.now());

  const [slots, setSlots] = useState([]);
  const [slotsBusy, setSlotsBusy] = useState(false);
  const [slotMode, setSlotMode] = useState('');

  const [locationCountryDraft, setLocationCountryDraft] = useState('');
  const [locationStateDraft, setLocationStateDraft] = useState('');
  const [locationCityDraft, setLocationCityDraft] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);

  const locationCountryOptions = useMemo(() => {
    const list = Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const locationStateOptions = useMemo(() => {
    if (!locationCountryDraft) return [];
    const list = State.getStatesOfCountry(locationCountryDraft).map((s) => ({ code: s.isoCode, name: s.name }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [locationCountryDraft]);

  const selectedLocationStateCode = useMemo(() => {
    const match = locationStateOptions.find((s) => String(s.name) === String(locationStateDraft));
    return match ? match.code : '';
  }, [locationStateOptions, locationStateDraft]);

  const locationCityOptions = useMemo(() => {
    if (!locationCountryDraft || !selectedLocationStateCode) return [];
    const list = City.getCitiesOfState(locationCountryDraft, selectedLocationStateCode).map((c) => c.name);
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [locationCountryDraft, selectedLocationStateCode]);

  const selectedDoctor = useMemo(() => doctors.find((d) => String(d._id) === String(booking.doctorId)), [doctors, booking.doctorId]);

  const specializationOptions = useMemo(() => {
    const fromDoctors = doctors
      .map((d) => String(d.specialization || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...SPECIALIZATION_OPTIONS, ...fromDoctors])).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  useEffect(() => {
    const value = String(filters.specialization || '').trim();
    if (!value) return;
    const isCustom = !specializationOptions.includes(value);
    if (customSpecializationEnabled !== isCustom) setCustomSpecializationEnabled(isCustom);
  }, [filters.specialization, specializationOptions, customSpecializationEnabled]);

  const specializationSelectValue = customSpecializationEnabled ? '__custom__' : filters.specialization;

  const bookingDate = useMemo(() => {
    if (!booking.date) return null;
    const d = new Date(`${booking.date}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [booking.date]);

  const bookingDay = useMemo(() => {
    if (!bookingDate) return null;
    return bookingDate.getDay();
  }, [bookingDate]);

  const dayAllowed = useMemo(() => {
    if (slotsBusy) return true;
    if (slotMode === 'date') return true;
    if (!selectedDoctor) return true;
    if (!bookingDate) return true;
    const days = selectedDoctor.availableDays || [];
    if (!Array.isArray(days) || days.length === 0) return true;
    if (bookingDay === null) return true;
    return days.includes(bookingDay);
  }, [selectedDoctor, bookingDate, bookingDay, slotMode, slotsBusy]);

  const isPastDate = useMemo(() => {
    if (!booking.date) return false;
    return booking.date < todayISO;
  }, [booking.date, todayISO]);

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!booking.doctorId || !booking.date) {
      setSlots([]);
      setSlotsBusy(false);
      setSlotMode('');
      return;
    }

    let alive = true;
    setSlots([]);
    setSlotMode('');
    setSlotsBusy(true);
    api
      .get(`/doctors/${booking.doctorId}/slots`, { params: { date: booking.date } })
      .then((res) => {
        if (!alive) return;
        const next = Array.isArray(res.data?.slots) ? res.data.slots : [];
        setSlots(next);
        setSlotMode(String(res.data?.mode || ''));
      })
      .catch(() => {
        if (!alive) return;
        setSlots([]);
        setSlotMode('');
      })
      .finally(() => {
        if (!alive) return;
        setSlotsBusy(false);
      });

    return () => {
      alive = false;
    };
  }, [booking.doctorId, booking.date]);

  const isSlotEnded = useMemo(() => {
    if (!booking.timeSlot) return false;
    if (booking.date !== todayISO) return false;

    const m = String(booking.timeSlot).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!m) return false;

    const endH = Number(m[3]);
    const endM = Number(m[4]);
    if (!Number.isFinite(endH) || !Number.isFinite(endM)) return false;

    const now = new Date(nowTick);
    const end = new Date(now);
    end.setHours(endH, endM, 0, 0);

    return now >= end;
  }, [booking.timeSlot, booking.date, todayISO, nowTick]);

  const availableSlotsForDate = useMemo(() => {
    if (booking.date !== todayISO) return slots;

    const now = new Date(nowTick);
    return slots.filter((s) => {
      const m = String(s).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (!m) return true;

      const endH = Number(m[3]);
      const endM = Number(m[4]);
      if (!Number.isFinite(endH) || !Number.isFinite(endM)) return true;

      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);
      return now < end;
    });
  }, [slots, booking.date, todayISO, nowTick]);

  useEffect(() => {
    if (!booking.timeSlot) return;
    if (booking.date !== todayISO) return;
    if (availableSlotsForDate.includes(booking.timeSlot)) return;
    setBooking((p) => ({ ...p, timeSlot: '' }));
  }, [booking.date, booking.timeSlot, todayISO, availableSlotsForDate]);

  useEffect(() => {
    setBooking((p) => {
      if (!p.doctorId) return { ...p, timeSlot: '' };
      const nextDate = !p.date || p.date < todayISO ? todayISO : p.date;
      return { ...p, timeSlot: '', date: nextDate };
    });
  }, [booking.doctorId, todayISO]);

  useEffect(() => {
    setBooking((p) => (p.timeSlot ? { ...p, timeSlot: '' } : p));
  }, [booking.date]);

  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (!locationCountryDraft) {
      if (locationStateDraft) setLocationStateDraft('');
      if (locationCityDraft) setLocationCityDraft('');
      return;
    }

    if (locationStateDraft && !locationStateOptions.some((s) => String(s.name) === String(locationStateDraft))) {
      setLocationStateDraft('');
      setLocationCityDraft('');
    }
  }, [locationCountryDraft, locationStateDraft, locationStateOptions]);

  useEffect(() => {
    if (!locationCountryDraft || !locationStateDraft) {
      if (locationCityDraft) setLocationCityDraft('');
      return;
    }

    if (locationCityDraft && !locationCityOptions.includes(locationCityDraft)) {
      setLocationCityDraft('');
    }
  }, [locationCountryDraft, locationStateDraft, locationCityDraft, locationCityOptions]);

  useEffect(() => {
    const country = String(locationCountryDraft || '').trim().toUpperCase();
    const state = String(locationStateDraft || '').trim();
    const city = String(locationCityDraft || '').trim();
    if (!country || !state || !city) {
      setDoctors([]);
      return;
    }

    let alive = true;
    setError('');
    setLocationBusy(true);

    const t = setTimeout(() => {
      api
        .get('/doctors', { params: { ...filters, country, state, city } })
        .then((res) => {
          if (!alive) return;
          setDoctors(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          if (!alive) return;
          setDoctors([]);
          setError(err?.response?.data?.message || err.message || 'Failed to search doctors');
        })
        .finally(() => {
          if (!alive) return;
          setLocationBusy(false);
        });
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [locationCountryDraft, locationStateDraft, locationCityDraft, filters]);

  const isBookingReady = useMemo(() => {
    if (!booking.doctorId || !booking.date) return false;
    if (isPastDate) return false;
    if (!dayAllowed) return false;
    if (!booking.timeSlot) return false;
    if (slots.length === 0) return false;
    if (isSlotEnded) return false;
    if (slotsBusy) return false;
    return true;
  }, [booking.doctorId, booking.date, booking.timeSlot, dayAllowed, slots.length, isPastDate, isSlotEnded, slotsBusy]);

  const load = async () => {
    const meRes = await api.get('/patients/me');
    const apptRes = await api.get('/appointments/me');
    setMe(meRes.data);
    setAppointments(apptRes.data);
  };

  useEffect(() => {
    setFilters({ specialization: '', minExperience: '', availabilityDay: '' });
    setBooking({ doctorId: '', date: '', timeSlot: '' });
    setLocationCountryDraft('');
    setLocationStateDraft('');
    setLocationCityDraft('');
    setDoctors([]);
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load dashboard'));
  }, []);

  const onBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isPastDate) {
      setError('You cannot book an appointment for a previous date.');
      return;
    }

    if (slotsBusy) {
      setError('Please wait, loading time slots...');
      return;
    }

    if (slots.length === 0) {
      setError('No time slots available for the selected date.');
      return;
    }

    if (isSlotEnded) {
      setError('Selected time slot is already completed for today.');
      return;
    }

    setBusy(true);
    try {
      await api.post('/appointments', booking);
      setSuccess('Submitted');
      setBooking((p) => ({ doctorId: p.doctorId, date: p.date || todayISO, timeSlot: '' }));
      const apptRes = await api.get('/appointments/me');
      setAppointments(apptRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Booking failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="hb-card-title">
            {greeting}{me && (me.title || me.name) ? `, ${[me.title, me.name].filter(Boolean).join(' ')}` : ''}
          </div>
          <div className="flex gap-2">
            <Link className="hb-btn-secondary" to="/patient/appointments">My Appointments</Link>
            <Link className="hb-btn-primary" to="/patient/settings">Edit Profile</Link>
          </div>
        </div>
      </div>

      {success ? <div className="text-sm text-emerald-700">{success}</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="hb-card p-6">
        <div className="font-semibold text-slate-900">Search Doctors</div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-slate-700">Country</label>
            <select
              className="hb-input mt-1"
              value={locationCountryDraft}
              onChange={(e) => {
                setLocationCountryDraft(e.target.value);
                setLocationStateDraft('');
                setLocationCityDraft('');
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
              value={locationStateDraft}
              onChange={(e) => {
                setLocationStateDraft(e.target.value);
                setLocationCityDraft('');
              }}
              disabled={!locationCountryDraft}
            >
              <option value="">Select state</option>
              {locationStateOptions.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-700">City</label>
            <select className="hb-input mt-1" value={locationCityDraft} onChange={(e) => setLocationCityDraft(e.target.value)} disabled={!locationCountryDraft || !locationStateDraft}>
              <option value="">Select city</option>
              {locationCityOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {locationBusy ? <div className="mt-2 text-sm text-slate-700">Loading doctors...</div> : null}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-slate-700">Specialization</label>
            <select
              className="hb-input mt-1"
              value={specializationSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') {
                  setCustomSpecializationEnabled(true);
                  setFilters((p) => ({ ...p, specialization: specializationOptions.includes(p.specialization) ? '' : p.specialization }));
                } else {
                  setCustomSpecializationEnabled(false);
                  setFilters((p) => ({ ...p, specialization: v }));
                }
              }}
            >
              <option value="">Any specialization</option>
              {specializationOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="__custom__">Custom</option>
            </select>
            {customSpecializationEnabled ? (
              <input
                className="hb-input mt-2"
                value={filters.specialization}
                onChange={(e) => setFilters((p) => ({ ...p, specialization: e.target.value }))}
                placeholder="Type specialization"
              />
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-700">Min Experience</label>
            <input
              className="hb-input mt-1"
              placeholder="e.g. 5"
              value={filters.minExperience}
              onChange={(e) => setFilters((p) => ({ ...p, minExperience: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Available Day</label>
            <select
              className="hb-input mt-1"
              value={filters.availabilityDay}
              onChange={(e) => setFilters((p) => ({ ...p, availabilityDay: e.target.value }))}
            >
              <option value="">Any day</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {doctors.map((d) => (
            <div key={d._id} className="hb-card p-4">
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-slate-700">{d.specialization}</div>
              {d.clinicCity ? <div className="hb-muted">City: {d.clinicCity}</div> : d.clinicLocation ? <div className="hb-muted">City: {d.clinicLocation}</div> : null}
              {d.clinicAddress ? <div className="hb-muted">Address: {d.clinicAddress}</div> : null}
              <div className="hb-muted">Experience: {d.experienceYears} yrs</div>
              <div className="hb-muted">Fees: ₹{d.consultationFees}</div>
              <div className="hb-muted">
                Rating: {d.ratingCount ? `${d.ratingAvg} / 5 (${d.ratingCount})` : 'No ratings yet'}
              </div>
              <div className="mt-2 flex gap-3 flex-wrap">
                <button
                  className="hb-btn-secondary"
                  type="button"
                  onClick={() => setBooking({ doctorId: d._id, date: todayISO, timeSlot: '' })}
                >
                  Book
                </button>
                <Link className="hb-btn-secondary" to={`/doctors/${d._id}/reviews`}>View Reviews</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hb-card p-6">
        <div className="font-semibold text-slate-900">Book Appointment</div>
        {selectedDoctor ? (
          <div className="hb-muted mt-1">Selected: {selectedDoctor.name} ({selectedDoctor.specialization})</div>
        ) : (
          <div className="hb-muted mt-1">Select a doctor and click Book.</div>
        )}

        <form onSubmit={onBook} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-sm text-slate-700">Select date</label>
            <input
              className="hb-input mt-1 hb-date"
              type="date"
              value={booking.date}
              onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value }))}
              placeholder="DD MM YYYY"
              title="DD MM YYYY"
              min={todayISO}
              required
              disabled={!booking.doctorId}
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Select slot</label>
            <select
              className="hb-input mt-1"
              value={booking.timeSlot}
              onChange={(e) => setBooking((p) => ({ ...p, timeSlot: e.target.value }))}
              required
              disabled={!booking.doctorId || slotsBusy || slots.length === 0}
            >
              <option value="">{slotsBusy ? 'Loading slots...' : 'Select time slot'}</option>
              {availableSlotsForDate.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button disabled={busy || !isBookingReady} className="hb-btn-primary" type="submit">
            {busy ? 'Booking...' : 'Confirm'}
          </button>
        </form>

        {!dayAllowed ? (
          <div className="mt-2 text-sm text-amber-700">
            Doctor is not available on the selected date. Please choose another date.
          </div>
        ) : null}

        {isSlotEnded ? (
          <div className="mt-2 text-sm text-red-600">
            Selected time slot is already completed for today.
          </div>
        ) : null}

        {isPastDate ? (
          <div className="mt-2 text-sm text-red-600">
            You cannot book an appointment for a previous date.
          </div>
        ) : null}

        {selectedDoctor && !slotsBusy && slots.length === 0 ? (
          <div className="mt-2 text-sm text-amber-700">
            This doctor has not set time slots for the selected date. Please choose another date or doctor.
          </div>
        ) : null}
      </div>

      <div className="hb-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-semibold text-slate-900">Support</div>
            <div className="hb-muted mt-1">Need help? Contact our support team.</div>
          </div>
          <div className="text-sm text-slate-700">
            <div><span className="font-medium">Email us:</span> <a className="hb-link" href="mailto:support@healthbridge.in">support@healthbridge.in</a></div>
            <div><span className="font-medium">Call us:</span> <a className="hb-link" href="tel:+919900000000">+91 99 xx xx xx xx</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}
