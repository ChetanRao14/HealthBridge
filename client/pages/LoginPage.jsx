import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="hb-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="hb-card-title">Login</div>
            <div className="hb-muted mt-1">Choose your role to continue.</div>
          </div>
          <div className="text-sm flex items-center gap-2">
            <div className="hb-muted">New here?</div>
            <Link className="hb-link" to="/register">Create an account</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link to="/login/patient" className="hb-card p-4 hover:border-teal-300 hover:shadow-md transition">
            <div className="font-semibold">Patient</div>
            <div className="hb-muted mt-1">Book appointments and consult verified doctors.</div>
          </Link>

          <Link to="/login/doctor" className="hb-card p-4 hover:border-teal-300 hover:shadow-md transition">
            <div className="font-semibold">Doctor</div>
            <div className="hb-muted mt-1">Manage bookings, chat, and upload prescriptions.</div>
          </Link>

          <Link to="/login/admin" className="hb-card p-4 hover:border-teal-300 hover:shadow-md transition">
            <div className="font-semibold">Admin</div>
            <div className="hb-muted mt-1">Verify doctors and monitor the platform.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
