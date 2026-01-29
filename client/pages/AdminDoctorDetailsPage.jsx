import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Country } from 'country-state-city';

export default function AdminDoctorDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const [docRes, rxRes] = await Promise.all([
      api.get(`/admin/doctors/${id}`),
      api.get(`/admin/doctors/${id}/prescriptions`),
    ]);
    setDoctor(docRes.data);
    setPrescriptions(Array.isArray(rxRes.data) ? rxRes.data : []);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load doctor details'));
  }, [id]);

  const clinicCountryName = (() => {
    const code = String(doctor?.clinicCountry || '').trim();
    if (!code) return '';
    return Country.getCountryByCode(code.toUpperCase())?.name || code;
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">Doctor Details</div>
            <div className="hb-muted mt-1">View full profile information.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/admin')}>
            Back
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {doctor ? (
        <>
        <div className="hb-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="hb-muted">Name</div>
              <div className="font-medium">{[doctor.title, doctor.name].filter(Boolean).join(' ') || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Email</div>
              <div className="font-medium">{doctor.email || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Phone</div>
              <div className="font-medium">{doctor.phone || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Status</div>
              <div className="font-medium">{doctor.status || '-'}</div>
              {doctor.rejectionReason ? <div className="hb-muted mt-1">Reason: {doctor.rejectionReason}</div> : null}
            </div>

            <div>
              <div className="hb-muted">Specialization</div>
              <div className="font-medium">{doctor.specialization || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Experience (Years)</div>
              <div className="font-medium">{doctor.experienceYears ?? '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Consultation Fee</div>
              <div className="font-medium">₹{doctor.consultationFees ?? 0}</div>
            </div>
            <div>
              <div className="hb-muted">Rating</div>
              <div className="font-medium">{(doctor.ratingAvg ?? 0).toFixed ? doctor.ratingAvg.toFixed(1) : doctor.ratingAvg || 0} / 5 ({doctor.ratingCount ?? 0} reviews)</div>
            </div>

            <div className="md:col-span-2">
              <div className="hb-muted">Hospital Location</div>
              <div className="font-medium">
                {[clinicCountryName, doctor.clinicState, doctor.clinicCity].filter(Boolean).join(', ') || '-'}
              </div>
              {doctor.clinicAddress ? <div className="hb-muted mt-1">{doctor.clinicAddress}</div> : null}
            </div>

            <div>
              <div className="hb-muted">Gender</div>
              <div className="font-medium">{doctor.gender || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">DOB</div>
              <div className="font-medium">{doctor.dob ? new Date(doctor.dob).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Age</div>
              <div className="font-medium">{doctor.age ?? '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Created</div>
              <div className="font-medium">{doctor.createdAt ? new Date(doctor.createdAt).toLocaleString() : '-'}</div>
            </div>

            <div className="md:col-span-2">
              <div className="hb-muted">Documents</div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="hb-card p-4">
                  <div className="hb-muted">Medical License</div>
                  {doctor.documents?.medicalLicense?.url ? (
                    <a className="hb-link" href={doctor.documents.medicalLicense.url} target="_blank" rel="noreferrer">View</a>
                  ) : (
                    <div className="hb-muted">Not uploaded</div>
                  )}
                </div>
                <div className="hb-card p-4">
                  <div className="hb-muted">Degree Certificate</div>
                  {doctor.documents?.degreeCertificate?.url ? (
                    <a className="hb-link" href={doctor.documents.degreeCertificate.url} target="_blank" rel="noreferrer">View</a>
                  ) : (
                    <div className="hb-muted">Not uploaded</div>
                  )}
                </div>
                <div className="hb-card p-4">
                  <div className="hb-muted">Government ID</div>
                  {doctor.documents?.governmentId?.url ? (
                    <a className="hb-link" href={doctor.documents.governmentId.url} target="_blank" rel="noreferrer">View</a>
                  ) : (
                    <div className="hb-muted">Not uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hb-card p-6">
          <div className="hb-card-title">Prescriptions</div>
          <div className="hb-muted mt-1">Prescriptions issued by this doctor.</div>

          <div className="mt-4 space-y-3">
            {prescriptions.length === 0 ? <div className="hb-muted">No prescriptions.</div> : null}
            {prescriptions.map((p) => (
              <div key={p._id} className="hb-card p-4">
                <div className="text-sm">
                  <div className="font-medium">
                    {p.patient ? `${[p.patient.title, p.patient.name].filter(Boolean).join(' ')}` : 'Patient'}
                  </div>
                  <div className="text-slate-700">
                    {p.appointment?.date ? new Date(p.appointment.date).toLocaleDateString() : ''}
                    {p.appointment?.timeSlot ? ` - ${p.appointment.timeSlot}` : ''}
                  </div>
                  {p.notes ? <div className="hb-muted">Notes: {p.notes}</div> : null}
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {p.file?.url ? (
                    <a className="hb-btn-secondary" href={p.file.url} target="_blank" rel="noreferrer">View Prescription</a>
                  ) : (
                    <div className="hb-muted">No file</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      ) : (
        <div className="hb-muted">Loading...</div>
      )}
    </div>
  );
}
