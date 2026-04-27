import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

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

const DEFAULT_SLOT_OPTIONS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '18:00-19:00',
  '19:00-20:00',
];

export default function DoctorConsultationSettingsPage() {
  const navigate = useNavigate();

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }, []);

  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [slotError, setSlotError] = useState('');

  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [customSpecializationEnabled, setCustomSpecializationEnabled] = useState(false);
  const [consultationFees, setConsultationFees] = useState('');

  const [availableDays, setAvailableDays] = useState([]);
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [slotToAddDate, setSlotToAddDate] = useState('');
  const [customSlotDate, setCustomSlotDate] = useState('');

  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotToAdd, setSlotToAdd] = useState('');
  const [customSlot, setCustomSlot] = useState('');

  const specializationOptions = useMemo(() => {
    const current = String(me?.specialization || '').trim();
    return Array.from(new Set([...SPECIALIZATION_OPTIONS, ...(current ? [current] : [])])).sort((a, b) => a.localeCompare(b));
  }, [me?.specialization]);

  useEffect(() => {
    const value = String(specialization || '').trim();
    if (!value) return;
    const isCustom = !specializationOptions.includes(value);
    if (customSpecializationEnabled !== isCustom) setCustomSpecializationEnabled(isCustom);
  }, [specialization, specializationOptions, customSpecializationEnabled]);

  const specializationSelectValue = customSpecializationEnabled ? '__custom__' : specialization;

  const load = async () => {
    const res = await api.get('/doctor/me');
    setMe(res.data);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load settings'));
  }, []);

  useEffect(() => {
    if (!me) return;
    setExperienceYears(String(me.experienceYears ?? 0));
    setSpecialization(String(me.specialization || ''));
    setConsultationFees(String(me.consultationFees ?? 0));
    setAvailableDays(Array.isArray(me.availableDays) ? me.availableDays : []);
    setAvailableSlotsByDate(Array.isArray(me.availableSlotsByDate) ? me.availableSlotsByDate : []);
    setAvailableSlots(Array.isArray(me.availableSlots) ? me.availableSlots : []);
    setSelectedDate(todayISO);
    setSlotToAddDate('');
    setCustomSlotDate('');
    setSlotToAdd('');
    setCustomSlot('');
  }, [me, todayISO]);

  useEffect(() => {
    if (!success) return undefined;
    const t = setTimeout(() => setSuccess(''), 2500);
    return () => clearTimeout(t);
  }, [success]);

  const toggleDay = (day) => {
    setAvailableDays((prev) => {
      const has = prev.includes(day);
      const next = has ? prev.filter((d) => d !== day) : [...prev, day];
      return next.sort((a, b) => a - b);
    });
  };

  const addSlot = (slot) => {
    const clean = String(slot || '').trim();
    if (!clean) return;

    setAvailableSlots((prev) => {
      if (prev.includes(clean)) return prev;
      return [...prev, clean];
    });
  };

  const removeSlot = (slot) => {
    setAvailableSlots((prev) => prev.filter((s) => s !== slot));
  };

  const addSlotForDate = (slot) => {
    const clean = String(slot || '').trim();
    if (!clean) return;
    if (!selectedDate) return;

    setSlotError('');

    setAvailableSlotsByDate((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const idx = next.findIndex((e) => String(e.date) === String(selectedDate));

      if (idx === -1) {
        next.push({ date: selectedDate, slots: [clean] });
        return next.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      }

      const existingSlots = Array.isArray(next[idx].slots) ? next[idx].slots : [];
      if (existingSlots.includes(clean)) return next;
      next[idx] = { ...next[idx], slots: [...existingSlots, clean] };
      return next;
    });
  };

  const removeSlotForDate = (slot) => {
    setAvailableSlotsByDate((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const idx = next.findIndex((e) => String(e.date) === String(selectedDate));
      if (idx === -1) return next;

      const remaining = (Array.isArray(next[idx].slots) ? next[idx].slots : []).filter((s) => s !== slot);
      if (remaining.length === 0) {
        return next.filter((e) => String(e.date) !== String(selectedDate));
      }
      next[idx] = { ...next[idx], slots: remaining };
      return next;
    });
  };

  const removeDateEntry = (date) => {
    setAvailableSlotsByDate((prev) => (Array.isArray(prev) ? prev.filter((e) => String(e.date) !== String(date)) : []));
  };

  const slotsForSelectedDate = useMemo(() => {
    const entry = availableSlotsByDate.find((e) => String(e.date) === String(selectedDate));
    return entry && Array.isArray(entry.slots) ? entry.slots : [];
  }, [availableSlotsByDate, selectedDate]);

  const slotOptionsForSelectedDate = useMemo(() => {
    if (selectedDate !== todayISO) return DEFAULT_SLOT_OPTIONS;

    const now = new Date();
    return DEFAULT_SLOT_OPTIONS.filter((s) => {
      const m = String(s).match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
      if (!m) return true;
      const endH = Number(m[3]);
      const endM = Number(m[4]);
      if (!Number.isFinite(endH) || !Number.isFinite(endM)) return true;
      const end = new Date(now);
      end.setHours(endH, endM, 0, 0);
      return now < end;
    });
  }, [selectedDate, todayISO]);

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/doctor/me', {
        experienceYears: Number(experienceYears),
        specialization,
        consultationFees: Number(consultationFees),
        availableDays,
        availableSlotsByDate,
        availableSlots,
      });

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
            <div className="hb-card-title">Consultation Settings</div>
            <div className="hb-muted mt-1">Update specialization, fees and availability.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/doctor')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6">
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700">Experience (Years)</label>
            <input className="hb-input mt-1" type="number" min="0" max="80" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} onWheel={(e) => e.target.blur()} />
          </div>

          <div>
            <label className="text-sm text-slate-700">Specialization</label>
            <select
              className="hb-input mt-1"
              value={specializationSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') {
                  setCustomSpecializationEnabled(true);
                  setSpecialization((prev) => (specializationOptions.includes(String(prev || '').trim()) ? '' : prev));
                } else {
                  setCustomSpecializationEnabled(false);
                  setSpecialization(v);
                }
              }}
              required
            >
              <option value="">Select specialization</option>
              {specializationOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="__custom__">Custom</option>
            </select>
            {customSpecializationEnabled ? (
              <input className="hb-input mt-2" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Type specialization" />
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-700">Consultation Fee (₹)</label>
            <input className="hb-input mt-1" type="number" min="0" value={consultationFees} onChange={(e) => setConsultationFees(e.target.value)} onWheel={(e) => e.target.blur()} />
          </div>

          <div>
            <div className="text-sm text-slate-700">Available Days</div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <label key={d} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={availableDays.includes(d)} onChange={() => toggleDay(d)} />
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700">Slots for a Specific Date</label>
            <div className="hb-muted mt-1">Patients will see slots for the date they select.</div>

            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="md:col-span-1">
                  <label className="text-xs text-slate-600">Date</label>
                  <input className="hb-input mt-1" type="date" value={selectedDate} min={todayISO} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Select slot</label>
                  <select className="hb-input mt-1" value={slotToAddDate} onChange={(e) => setSlotToAddDate(e.target.value)}>
                    <option value="">Select slot</option>
                    {slotOptionsForSelectedDate.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="hb-btn-secondary"
                  disabled={!slotToAddDate}
                  onClick={() => {
                    addSlotForDate(slotToAddDate);
                    setSlotToAddDate('');
                  }}
                >
                  Add Selected
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="hidden md:block" />

                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Custom slot</label>
                  <input className="hb-input mt-1" value={customSlotDate} onChange={(e) => setCustomSlotDate(e.target.value)} placeholder="09:30-10:30" />
                </div>

                <button
                  type="button"
                  className="hb-btn-secondary"
                  disabled={!customSlotDate}
                  onClick={() => {
                    addSlotForDate(customSlotDate);
                    setCustomSlotDate('');
                  }}
                >
                  Add Custom
                </button>
              </div>
            </div>

            {slotError ? <div className="mt-2 text-sm text-red-600">{slotError}</div> : null}

            {slotsForSelectedDate.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {slotsForSelectedDate.map((s) => (
                  <div key={s} className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-3 py-1">
                    <span className="text-sm text-slate-800">{s}</span>
                    <button type="button" className="text-xs hb-link" onClick={() => removeSlotForDate(s)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">No slots added for this date.</div>
            )}

            {availableSlotsByDate.length > 0 ? (
              <div className="mt-3">
                <div className="text-xs text-slate-600">Configured dates</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableSlotsByDate.map((e) => (
                    <div key={e.date} className="flex items-center gap-2 border border-slate-200 bg-white rounded-full px-3 py-1">
                      <button type="button" className="text-sm hb-link" onClick={() => setSelectedDate(e.date)}>
                        {e.date} ({Array.isArray(e.slots) ? e.slots.length : 0})
                      </button>
                      <button type="button" className="text-xs hb-link" onClick={() => removeDateEntry(e.date)}>
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-sm text-slate-700">Default Time Slots (Fallback)</label>
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Select slot</label>
                  <select className="hb-input mt-1" value={slotToAdd} onChange={(e) => setSlotToAdd(e.target.value)}>
                    <option value="">Select slot</option>
                    {DEFAULT_SLOT_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="hb-btn-secondary"
                  disabled={!slotToAdd}
                  onClick={() => {
                    addSlot(slotToAdd);
                    setSlotToAdd('');
                  }}
                >
                  Add Selected
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Custom slot</label>
                  <input className="hb-input mt-1" value={customSlot} onChange={(e) => setCustomSlot(e.target.value)} placeholder="09:30-10:30" />
                </div>
                <button
                  type="button"
                  className="hb-btn-secondary"
                  disabled={!customSlot}
                  onClick={() => {
                    addSlot(customSlot);
                    setCustomSlot('');
                  }}
                >
                  Add Custom
                </button>
              </div>
            </div>

            {availableSlots.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSlots.map((s) => (
                  <div key={s} className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-3 py-1">
                    <span className="text-sm text-slate-800">{s}</span>
                    <button type="button" className="text-xs hb-link" onClick={() => removeSlot(s)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">No slots added yet.</div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="hb-btn-secondary" onClick={() => navigate('/doctor')}>
              Back
            </button>
            <button disabled={saving} className="hb-btn-primary" type="submit">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {success ? <div className="text-sm text-emerald-700">{success}</div> : null}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
