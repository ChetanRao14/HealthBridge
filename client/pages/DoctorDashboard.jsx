import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function DoctorDashboard() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const [me, setMe] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const [docFiles, setDocFiles] = useState({
    medicalLicense: null,
    degreeCertificate: null,
    governmentId: null,
  });

  const load = async () => {
    const meRes = await api.get('/doctor/me');
    setMe(meRes.data);

    if (String(meRes.data?.status) !== 'approved') {
      setAppointments([]);
      return;
    }

    const apptRes = await api.get('/appointments/doctor');
    setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load dashboard'));
  }, []);

  const uploadDocuments = async () => {
    setError('');
    try {
      const fd = new FormData();
      if (docFiles.medicalLicense) fd.append('medicalLicense', docFiles.medicalLicense);
      if (docFiles.degreeCertificate) fd.append('degreeCertificate', docFiles.degreeCertificate);
      if (docFiles.governmentId) fd.append('governmentId', docFiles.governmentId);

      await api.post('/doctor/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await load();
      alert('Documents uploaded');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed (check Cloudinary env vars)');
    }
  };

  const metrics = useMemo(() => {
    const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(String(a.status)));
    const completed = appointments.filter((a) => String(a.status) === 'completed');

    const consultedPatients = new Set(
      completed
        .map((a) => a.patient && (a.patient._id || a.patient))
        .filter(Boolean)
        .map(String)
    ).size;

    const toConsultPatients = new Set(
      upcoming
        .map((a) => a.patient && (a.patient._id || a.patient))
        .filter(Boolean)
        .map(String)
    ).size;

    const ratingAvgRaw = typeof me?.ratingAvg === 'number' ? me.ratingAvg : 0;
    const ratingAvg = Number.isFinite(ratingAvgRaw) ? ratingAvgRaw : 0;
    const ratingCount = typeof me?.ratingCount === 'number' ? me.ratingCount : 0;

    const filled = Math.max(0, Math.min(5, Math.round(ratingAvg)));
    const starText = `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;

    return { consultedPatients, toConsultPatients, ratingAvg, ratingCount, starText };
  }, [appointments, me?.ratingAvg, me?.ratingCount]);

  return (
    <div className="space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="hb-card-title">{greeting}{me?.name ? `, ${[me.title || 'Dr', me.name].filter(Boolean).join(' ')}` : ''}</div>
          <div className="flex gap-2">
            <Link className="hb-btn-secondary" to="/doctor/appointments">My Appointments</Link>
            <Link className="hb-btn-primary" to="/doctor/settings/profile">Edit Profile</Link>
          </div>
        </div>
      </div>

      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900">Consultation Settings</div>
            <div className="hb-muted mt-1">Specialization, fees and availability.</div>
          </div>
          <Link className="hb-btn-primary" to="/doctor/settings/consultation">Update Settings</Link>
        </div>

        {me ? (
          <div className="mt-4 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="hb-card p-4">
              <div className="hb-muted">Consultation Fee</div>
              <div className="font-medium">₹{me.consultationFees ?? 0}</div>
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Available Days</div>
              <div className="font-medium">
                {Array.isArray(me.availableDays) && me.availableDays.length > 0
                  ? me.availableDays.map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')
                  : 'Not set'}
              </div>
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Time Slots</div>
              <div className="font-medium">
                {Array.isArray(me.availableSlotsByDate) && me.availableSlotsByDate.length > 0
                  ? `${me.availableSlotsByDate.length} dates`
                  : Array.isArray(me.availableSlots) && me.availableSlots.length > 0
                    ? `${me.availableSlots.length} slots`
                    : 'Not set'}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {me && me.status === 'approved' ? null : (
        <div className="hb-card p-6">
          <div className="font-semibold text-slate-900">Verification</div>
          <div className="hb-muted mt-1">
            {me?.status === 'rejected'
              ? 'Your verification was rejected. Please upload documents again.'
              : me?.status === 'blocked'
                ? 'Your account is blocked. Please contact support.'
                : 'Upload documents to request admin approval.'}
          </div>

          {me?.status === 'rejected' && me?.rejectionReason ? (
            <div className="mt-2 text-sm text-amber-700">
              Reason: <span className="font-medium">{me.rejectionReason}</span>
            </div>
          ) : null}

          <div className="mt-4 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="hb-card p-4">
              <div className="hb-muted">Medical License</div>
              {me?.documents?.medicalLicense?.url ? (
                <a className="hb-link" href={me.documents.medicalLicense.url} target="_blank" rel="noreferrer">View</a>
              ) : (
                <div className="hb-muted">Not uploaded</div>
              )}
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Degree Certificate</div>
              {me?.documents?.degreeCertificate?.url ? (
                <a className="hb-link" href={me.documents.degreeCertificate.url} target="_blank" rel="noreferrer">View</a>
              ) : (
                <div className="hb-muted">Not uploaded</div>
              )}
            </div>
            <div className="hb-card p-4">
              <div className="hb-muted">Government ID</div>
              {me?.documents?.governmentId?.url ? (
                <a className="hb-link" href={me.documents.governmentId.url} target="_blank" rel="noreferrer">View</a>
              ) : (
                <div className="hb-muted">Not uploaded</div>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="hb-input" type="file" onChange={(e) => setDocFiles((p) => ({ ...p, medicalLicense: e.target.files[0] }))} />
            <input className="hb-input" type="file" onChange={(e) => setDocFiles((p) => ({ ...p, degreeCertificate: e.target.files[0] }))} />
            <input className="hb-input" type="file" onChange={(e) => setDocFiles((p) => ({ ...p, governmentId: e.target.files[0] }))} />
          </div>
          <button className="mt-3 hb-btn-primary" type="button" onClick={uploadDocuments}>
            Upload
          </button>
        </div>
      )}

      <div className="hb-card p-6">
        <div className="font-semibold text-slate-900">Overview</div>
        <div className="hb-muted mt-1">Patients and rating.</div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="hb-card p-4">
            <div className="hb-muted">Patients Consulted</div>
            <div className="text-xl font-semibold">{metrics.consultedPatients}</div>
          </div>
          <div className="hb-card p-4">
            <div className="hb-muted">Patients To Be Consulted</div>
            <div className="text-xl font-semibold">{metrics.toConsultPatients}</div>
          </div>
          <div className="hb-card p-4">
            <div className="hb-muted">Rating</div>
            <div className="text-xl font-semibold">{metrics.starText} {metrics.ratingAvg.toFixed(1)} / 5</div>
            <div className="hb-muted mt-1">{metrics.ratingCount} reviews</div>
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

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
