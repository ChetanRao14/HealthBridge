import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('upcoming');

  const load = async () => {
    const res = await api.get('/appointments/doctor');
    setAppointments(res.data);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load appointments'));
  }, []);

  const respond = async (id, action) => {
    setError('');
    setBusyId(id);
    try {
      const reason = action === 'reject' ? window.prompt('Reason for rejection?') : '';
      await api.patch(`/appointments/${id}/respond`, { action, reason });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    } finally {
      setBusyId('');
    }
  };

  const complete = async (id) => {
    setError('');
    setBusyId(id);
    try {
      await api.patch(`/appointments/${id}/complete`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    } finally {
      setBusyId('');
    }
  };

  const filtered = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();

    return appointments.filter((a) => {
      if (status && String(a.status) !== String(status)) return false;

      if (!q) return true;

      const patientName = String(a.patient?.name || '').toLowerCase();
      const patientEmail = String(a.patient?.email || '').toLowerCase();
      const timeSlot = String(a.timeSlot || '').toLowerCase();
      const day = a.date ? new Date(a.date).toLocaleDateString().toLowerCase() : '';

      return (
        patientName.includes(q)
        || patientEmail.includes(q)
        || timeSlot.includes(q)
        || day.includes(q)
        || String(a.status || '').toLowerCase().includes(q)
      );
    });
  }, [appointments, search, status]);

  const { upcoming, completed } = useMemo(() => {
    const up = [];
    const done = [];
    for (const a of filtered) {
      if (['pending', 'confirmed'].includes(a.status)) up.push(a);
      else done.push(a);
    }
    return { upcoming: up, completed: done };
  }, [filtered]);

  const visibleAppointments = tab === 'completed' ? completed : upcoming;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">My Appointments</div>
            <div className="hb-muted mt-1">Upcoming and completed appointments.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/doctor')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-700">Search</label>
            <input
              className="hb-input mt-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, date, slot, status"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700">Status</label>
            <select className="hb-input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="hb-card p-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tab === 'upcoming' ? 'hb-btn-primary' : 'hb-btn-secondary'}
            onClick={() => setTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={tab === 'completed' ? 'hb-btn-primary' : 'hb-btn-secondary'}
            onClick={() => setTab('completed')}
          >
            Completed
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {visibleAppointments.length === 0 ? <div className="hb-muted">No appointments.</div> : null}
          {visibleAppointments.map((a) => (
            <div key={a._id} className="hb-card p-4">
              <div className="text-sm">
                <div className="font-medium">{a.patient?.name}</div>
                <div className="text-slate-700">{new Date(a.date).toLocaleDateString()} - {a.timeSlot}</div>
                <div className="hb-muted">Status: {a.status}</div>
              </div>

              <div className="mt-2 flex gap-3 flex-wrap">
                <Link className="hb-btn-secondary" to={`/appointments/${a._id}/chat`}>Chat</Link>
                <Link className="hb-btn-secondary" to={`/appointments/${a._id}/prescription`}>Prescription</Link>

                {tab === 'upcoming' && a.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === a._id}
                      onClick={() => respond(a._id, 'accept')}
                      className="text-sm px-3 py-1.5 rounded bg-green-600 text-white"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyId === a._id}
                      onClick={() => respond(a._id, 'reject')}
                      className="text-sm px-3 py-1.5 rounded bg-red-600 text-white"
                    >
                      Reject
                    </button>
                  </>
                ) : null}

                {tab === 'upcoming' && a.status === 'confirmed' ? (
                  <button
                    type="button"
                    disabled={busyId === a._id}
                    onClick={() => complete(a._id)}
                    className="text-sm px-3 py-1.5 rounded bg-gray-900 text-white"
                  >
                    Mark Completed
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
