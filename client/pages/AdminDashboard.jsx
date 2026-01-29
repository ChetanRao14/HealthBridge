import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const [tab, setTab] = useState('doctors');

  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorStatus, setDoctorStatus] = useState('');

  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatus, setPatientStatus] = useState('');

  const [apptSearch, setApptSearch] = useState('');
  const [apptStatus, setApptStatus] = useState('');

  const filteredDoctors = useMemo(() => {
    const q = String(doctorSearch || '').trim().toLowerCase();
    return doctors.filter((d) => {
      if (doctorStatus && String(d.status) !== String(doctorStatus)) return false;
      if (!q) return true;

      const name = String(d.name || '').toLowerCase();
      const email = String(d.email || '').toLowerCase();
      const spec = String(d.specialization || '').toLowerCase();
      const statusVal = String(d.status || '').toLowerCase();
      const reason = String(d.rejectionReason || '').toLowerCase();
      return name.includes(q) || email.includes(q) || spec.includes(q) || statusVal.includes(q) || reason.includes(q);
    });
  }, [doctors, doctorSearch, doctorStatus]);

  const filteredPatients = useMemo(() => {
    const q = String(patientSearch || '').trim().toLowerCase();
    return patients.filter((p) => {
      if (patientStatus && String(p.status) !== String(patientStatus)) return false;
      if (!q) return true;

      const name = String(p.name || '').toLowerCase();
      const email = String(p.email || '').toLowerCase();
      const statusVal = String(p.status || '').toLowerCase();
      return name.includes(q) || email.includes(q) || statusVal.includes(q);
    });
  }, [patients, patientSearch, patientStatus]);

  const filteredAppointments = useMemo(() => {
    const q = String(apptSearch || '').trim().toLowerCase();

    return appointments.filter((a) => {
      if (apptStatus && String(a.status) !== String(apptStatus)) return false;
      if (!q) return true;

      const patientName = String(a.patient?.name || '').toLowerCase();
      const patientEmail = String(a.patient?.email || '').toLowerCase();
      const doctorName = String(a.doctor?.name || '').toLowerCase();
      const doctorEmail = String(a.doctor?.email || '').toLowerCase();
      const doctorSpec = String(a.doctor?.specialization || '').toLowerCase();
      const timeSlot = String(a.timeSlot || '').toLowerCase();
      const day = a.date ? new Date(a.date).toLocaleDateString().toLowerCase() : '';

      return (
        patientName.includes(q)
        || patientEmail.includes(q)
        || doctorName.includes(q)
        || doctorEmail.includes(q)
        || doctorSpec.includes(q)
        || timeSlot.includes(q)
        || day.includes(q)
        || String(a.status || '').toLowerCase().includes(q)
      );
    });
  }, [appointments, apptSearch, apptStatus]);

  const load = async () => {
    const [aRes, dRes, pRes, apRes] = await Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/doctors'),
      api.get('/admin/patients'),
      api.get('/admin/appointments'),
    ]);

    setAnalytics(aRes.data);
    setDoctors(dRes.data);
    setPatients(pRes.data);
    setAppointments(apRes.data);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load admin dashboard'));
  }, []);

  const approve = async (id) => {
    setError('');
    try {
      await api.patch(`/admin/doctors/${id}/approve`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    }
  };

  const reject = async (id) => {
    setError('');
    try {
      const reason = window.prompt('Reason for rejection?') || 'Rejected by admin';
      await api.patch(`/admin/doctors/${id}/reject`, { reason });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    }
  };

  const blockDoctor = async (id) => {
    setError('');
    try {
      await api.patch(`/admin/doctors/${id}/block`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    }
  };

  const blockPatient = async (id) => {
    setError('');
    try {
      await api.patch(`/admin/patients/${id}/block`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="hb-card-title">Admin Dashboard</div>
          <Link className="hb-btn-secondary" to="/admin/settings">Edit Profile</Link>
        </div>
        {analytics ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="hb-card p-4">
              <div className="hb-muted">Total Patients</div>
              <div className="text-xl font-semibold">{analytics.totalPatients}</div>
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Total Doctors</div>
              <div className="text-xl font-semibold">{analytics.totalDoctors}</div>
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Total Appointments</div>
              <div className="text-xl font-semibold">{analytics.totalAppointments}</div>
            </div>
          </div>
        ) : (
          <div className="hb-muted mt-2">Loading analytics...</div>
        )}
      </div>

      <div className="hb-card p-6">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tab === 'doctors' ? 'hb-btn-primary' : 'hb-btn-secondary'} onClick={() => setTab('doctors')}>Doctors</button>
          <button type="button" className={tab === 'patients' ? 'hb-btn-primary' : 'hb-btn-secondary'} onClick={() => setTab('patients')}>Patients</button>
          <button type="button" className={tab === 'appointments' ? 'hb-btn-primary' : 'hb-btn-secondary'} onClick={() => setTab('appointments')}>Appointments</button>
        </div>
      </div>

      <div className="hb-card p-6">
        {tab === 'doctors' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-700">Search</label>
              <input className="hb-input mt-1" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Search by doctor, specialization, email, status" />
            </div>
            <div>
              <label className="text-sm text-slate-700">Status</label>
              <select className="hb-input mt-1" value={doctorStatus} onChange={(e) => setDoctorStatus(e.target.value)}>
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="blocked">Blocked</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ) : null}

        {tab === 'patients' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-700">Search</label>
              <input className="hb-input mt-1" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Search by patient, email, status" />
            </div>
            <div>
              <label className="text-sm text-slate-700">Status</label>
              <select className="hb-input mt-1" value={patientStatus} onChange={(e) => setPatientStatus(e.target.value)}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        ) : null}

        {tab === 'appointments' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-700">Search</label>
              <input className="hb-input mt-1" value={apptSearch} onChange={(e) => setApptSearch(e.target.value)} placeholder="Search by patient, doctor, date, slot, status" />
            </div>
            <div>
              <label className="text-sm text-slate-700">Status</label>
              <select className="hb-input mt-1" value={apptStatus} onChange={(e) => setApptStatus(e.target.value)}>
                <option value="">All</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="hb-card p-6">
        <div className="mt-1 space-y-3">
          {tab === 'doctors' ? (
            <>
              {filteredDoctors.length === 0 ? <div className="hb-muted">No doctors.</div> : null}
              {filteredDoctors.map((d) => (
                <div key={d._id} className="hb-card p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">{d.name} <span className="text-gray-400">({d.specialization})</span></div>
                    <div className="text-slate-700">{d.email}</div>
                    <div className="hb-muted">Status: {d.status}</div>
                    {d.rejectionReason ? <div className="hb-muted">Reason: {d.rejectionReason}</div> : null}
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end md:justify-end">
                    <Link className="hb-btn-secondary" to={`/admin/doctors/${d._id}`}>View</Link>
                    {d.status === 'pending' ? (
                      <>
                        <button className="text-sm px-3 py-1.5 rounded bg-green-600 text-white" onClick={() => approve(d._id)}>
                          Approve
                        </button>
                        <button className="text-sm px-3 py-1.5 rounded bg-yellow-600 text-white" onClick={() => reject(d._id)}>
                          Reject
                        </button>
                      </>
                    ) : null}

                    {d.status !== 'blocked' ? (
                      <button className="text-sm px-3 py-1.5 rounded bg-red-600 text-white" onClick={() => blockDoctor(d._id)}>
                        Block
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {tab === 'patients' ? (
            <>
              {filteredPatients.length === 0 ? <div className="hb-muted">No patients.</div> : null}
              {filteredPatients.map((p) => (
                <div key={p._id} className="hb-card p-4 flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-slate-700">{p.email}</div>
                    <div className="hb-muted">Status: {p.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link className="hb-btn-secondary" to={`/admin/patients/${p._id}`}>View</Link>
                    <button className="text-sm px-3 py-1.5 rounded bg-red-600 text-white" onClick={() => blockPatient(p._id)}>
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {tab === 'appointments' ? (
            <>
              {filteredAppointments.length === 0 ? <div className="hb-muted">No appointments.</div> : null}
              {filteredAppointments.map((a) => (
                <div key={a._id} className="hb-card p-4 text-sm">
                  <div className="font-medium">{a.patient?.name} -&gt; Dr. {a.doctor?.name}</div>
                  <div className="text-slate-700">{new Date(a.date).toLocaleDateString()} - {a.timeSlot}</div>
                  <div className="hb-muted">Status: {a.status}</div>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
