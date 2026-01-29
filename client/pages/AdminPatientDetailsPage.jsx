import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Country } from 'country-state-city';

export default function AdminPatientDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get(`/admin/patients/${id}`);
    setPatient(res.data);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load patient details'));
  }, [id]);

  const locationCountryName = (() => {
    const code = String(patient?.locationCountry || '').trim();
    if (!code) return '';
    return Country.getCountryByCode(code.toUpperCase())?.name || code;
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">Patient Details</div>
            <div className="hb-muted mt-1">View full profile information.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/admin')}>
            Back
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {patient ? (
        <div className="hb-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="hb-muted">Name</div>
              <div className="font-medium">{[patient.title, patient.name].filter(Boolean).join(' ') || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Email</div>
              <div className="font-medium">{patient.email || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Phone</div>
              <div className="font-medium">{patient.phone || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Status</div>
              <div className="font-medium">{patient.status || '-'}</div>
            </div>

            <div>
              <div className="hb-muted">Gender</div>
              <div className="font-medium">{patient.gender || '-'}</div>
            </div>
            <div>
              <div className="hb-muted">DOB</div>
              <div className="font-medium">{patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Age</div>
              <div className="font-medium">{patient.age ?? '-'}</div>
            </div>
            <div>
              <div className="hb-muted">Created</div>
              <div className="font-medium">{patient.createdAt ? new Date(patient.createdAt).toLocaleString() : '-'}</div>
            </div>

            <div className="md:col-span-2">
              <div className="hb-muted">Location</div>
              <div className="font-medium">
                {[locationCountryName, patient.locationState, patient.locationCity].filter(Boolean).join(', ') || patient.location || '-'}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="hb-muted">Medical History</div>
              <div className="font-medium">{patient.medicalHistory || '-'}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hb-muted">Loading...</div>
      )}
    </div>
  );
}
