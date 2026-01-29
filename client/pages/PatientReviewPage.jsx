import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

function Stars({ value, onPick }) {
  const n = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={i <= n ? 'text-2xl text-amber-500' : 'text-2xl text-slate-300'}
          onClick={() => onPick(i)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function PatientReviewPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/appointments/me');
        const appt = (Array.isArray(res.data) ? res.data : []).find((a) => String(a._id) === String(appointmentId));
        setAppointment(appt || null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load appointment');
      }
    })();
  }, [appointmentId]);

  useEffect(() => {
    if (!appointment) return;
    setRating(Number(appointment.patientRating || 0));
    setReview(String(appointment.patientReview || ''));
  }, [appointment]);

  const canSubmit = useMemo(() => {
    if (!appointment) return false;
    if (appointment.status !== 'completed') return false;
    if (appointment.patientRating) return false;
    return rating >= 1 && rating <= 5;
  }, [appointment, rating]);

  const submit = async () => {
    setError('');
    setSuccess('');
    if (!canSubmit) return;
    setBusy(true);
    try {
      await api.patch(`/appointments/${appointmentId}/review`, { rating, review });
      setSuccess('Review submitted');
      setTimeout(() => navigate('/patient/appointments'), 600);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">Give Review</div>
            <div className="hb-muted mt-1">Rate your completed appointment.</div>
          </div>
          <button type="button" className="hb-btn-secondary" onClick={() => navigate('/patient/appointments')}>
            Back
          </button>
        </div>
      </div>

      <div className="hb-card p-6 space-y-4">
        {appointment ? (
          <div className="text-sm text-slate-700">
            <div className="font-medium">Dr. {appointment.doctor?.name} ({appointment.doctor?.specialization})</div>
            <div>{new Date(appointment.date).toLocaleDateString()} - {appointment.timeSlot}</div>
            <div className="hb-muted">Status: {appointment.status}</div>
          </div>
        ) : (
          <div className="hb-muted">Loading appointment...</div>
        )}

        {appointment && appointment.patientRating ? (
          <div className="text-sm text-slate-700">
            You already rated this appointment: <span className="font-medium">{appointment.patientRating}/5</span>
          </div>
        ) : null}

        <div>
          <div className="text-sm text-slate-700">Rating</div>
          <Stars value={rating} onPick={setRating} />
        </div>

        <div>
          <div className="text-sm text-slate-700">Review (optional)</div>
          <textarea
            className="hb-input mt-1"
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your experience..."
          />
        </div>

        <button className="hb-btn-primary" type="button" disabled={busy || !canSubmit} onClick={submit}>
          {busy ? 'Submitting...' : 'Submit Review'}
        </button>

        {success ? <div className="text-sm text-emerald-700">{success}</div> : null}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div>
          <Link className="hb-link" to="/patient/appointments">Back to My Appointments</Link>
        </div>
      </div>
    </div>
  );
}
