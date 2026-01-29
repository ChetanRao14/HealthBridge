import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrescriptionPage() {
  const { appointmentId } = useParams();
  const { user } = useAuth();

  const [doc, setDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get(`/appointments/${appointmentId}/prescription`);
    setDoc(res.data);
  };

  useEffect(() => {
    load().catch((e) => setError(e?.response?.data?.message || e.message || 'No prescription yet'));
  }, [appointmentId]);

  const upload = async () => {
    setError('');
    try {
      if (!file) {
        setError('Choose a file');
        return;
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('notes', notes);

      const res = await api.post(`/appointments/${appointmentId}/prescription`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setDoc(res.data);
      setFile(null);
      setNotes('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed');
    }
  };

  return (
    <div className="hb-card p-6 space-y-4">
      <div>
        <div className="hb-card-title">Prescription</div>
        <div className="hb-muted">Appointment: {appointmentId}</div>
      </div>

      {doc ? (
        <div className="hb-card p-4">
          <div className="text-sm text-slate-700">Notes: {doc.notes || '-'}</div>
          {doc.file?.url ? (
            <a className="hb-link" href={doc.file.url} target="_blank" rel="noreferrer">
              View / Download
            </a>
          ) : (
            <div className="hb-muted">No file URL available</div>
          )}
        </div>
      ) : (
        <div className="hb-muted">No prescription uploaded yet.</div>
      )}

      {user?.role === 'doctor' ? (
        <div className="hb-card p-4">
          <div className="font-medium text-sm">Upload Prescription</div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="hb-input" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <input
              className="hb-input"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button className="mt-3 hb-btn-primary" type="button" onClick={upload}>
            Upload
          </button>
          <div className="mt-2 text-xs text-slate-500">Requires Cloudinary env vars configured on the backend.</div>
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
