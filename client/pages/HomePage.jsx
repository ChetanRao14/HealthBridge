import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user } = useAuth();

  const dashboardPath = user?.role === 'patient'
    ? '/patient'
    : user?.role === 'doctor'
      ? '/doctor'
      : user?.role === 'admin'
        ? '/admin'
        : '/login';

  return (
    <div className="space-y-6">
      <div className="hb-card p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">HealthBridge</div>
          <div className="hb-muted mt-3 text-base md:text-lg">
            Book appointments, chat securely, and manage prescriptions — all in one place.
          </div>
        </div>

        {user ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link className="hb-btn-primary" to={dashboardPath}>Open Dashboard</Link>
            <div className="text-sm text-slate-700">
              Logged in as <span className="font-medium">{user.role}</span>
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Fast booking</div>
            <div className="hb-muted mt-1">Pick a doctor, date, and slot — done.</div>
          </div>
          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Verified doctors</div>
            <div className="hb-muted mt-1">Approved profiles help build trust.</div>
          </div>
          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Appointments in one thread</div>
            <div className="hb-muted mt-1">Chat and prescriptions stay linked.</div>
          </div>
        </div>
      </div>

      <div className="hb-card p-6">
        <div>
          <div className="font-semibold text-slate-900">Choose your portal</div>
          <div className="hb-muted mt-1">Continue as a patient, doctor, or admin.</div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Patient</div>
            <div className="hb-muted mt-1">Search doctors and book appointments.</div>
            <div className="mt-4">
              <Link className="hb-btn-secondary" to={user?.role === 'patient' ? '/patient' : '/login/patient'}>
                Continue
              </Link>
            </div>
          </div>

          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Doctor</div>
            <div className="hb-muted mt-1">Manage appointments and prescriptions.</div>
            <div className="mt-4">
              <Link className="hb-btn-secondary" to={user?.role === 'doctor' ? '/doctor' : '/login/doctor'}>
                Continue
              </Link>
            </div>
          </div>

          <div className="hb-card p-5">
            <div className="font-semibold text-slate-900">Admin</div>
            <div className="hb-muted mt-1">Verify doctors and manage the platform.</div>
            <div className="mt-4">
              <Link className="hb-btn-secondary" to={user?.role === 'admin' ? '/admin' : '/login/admin'}>
                Continue
              </Link>
            </div>
          </div>
        </div>
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
