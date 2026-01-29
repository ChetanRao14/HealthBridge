import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

function Stars({ value }) {
  const n = Number(value) || 0;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? 'text-amber-500' : 'text-slate-300'}>★</span>
      ))}
    </span>
  );
}

export default function DoctorReviewsPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/doctors/${doctorId}/reviews`);
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load reviews');
      }
    })();
  }, [doctorId]);

  const doctor = data?.doctor;
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">Doctor Reviews</div>
            {doctor ? (
              <div className="mt-2 text-sm text-slate-700">
                <div className="font-medium">Dr. {doctor.name} ({doctor.specialization})</div>
                <div className="hb-muted mt-1">
                  <Stars value={doctor.ratingAvg} />
                  <span className="ml-2">{doctor.ratingAvg} / 5 ({doctor.ratingCount || 0})</span>
                </div>
              </div>
            ) : (
              <div className="hb-muted mt-2">Loading doctor...</div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" className="hb-btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="hb-card p-6">
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {reviews.length === 0 ? (
          <div className="hb-muted">No reviews yet.</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const patientName = [r.patient?.title, r.patient?.name].map((s) => String(s || '').trim()).filter(Boolean).join(' ');
              return (
                <div key={r._id} className="hb-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-slate-700">
                      <div className="font-medium">{patientName || 'Patient'}</div>
                      <div className="hb-muted mt-1">
                        <Stars value={r.patientRating} />
                        <span className="ml-2">{r.patientRating}/5</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(r.reviewedAt || r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {r.patientReview ? <div className="mt-2 text-sm text-slate-700">{r.patientReview}</div> : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <Link className="hb-link" to="/patient">Back to Patient Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
