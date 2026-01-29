import React from 'react';
import { Route, Routes } from 'react-router-dom';

import TopBar from './components/TopBar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import PatientLoginPage from './pages/PatientLoginPage.jsx';
import DoctorLoginPage from './pages/DoctorLoginPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';

import PatientDashboard from './pages/PatientDashboard.jsx';
import PatientSettingsPage from './pages/PatientSettingsPage.jsx';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage.jsx';
import PatientReviewPage from './pages/PatientReviewPage.jsx';
import DoctorReviewsPage from './pages/DoctorReviewsPage.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage.jsx';
import DoctorProfileSettingsPage from './pages/DoctorProfileSettingsPage.jsx';
import DoctorConsultationSettingsPage from './pages/DoctorConsultationSettingsPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProfileSettingsPage from './pages/AdminProfileSettingsPage.jsx';
import AdminDoctorDetailsPage from './pages/AdminDoctorDetailsPage.jsx';
import AdminPatientDetailsPage from './pages/AdminPatientDetailsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrescriptionPage from './pages/PrescriptionPage.jsx';

export default function App() {
  return (
    <div className="hb-app-bg">
      <TopBar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/patient" element={<PatientLoginPage />} />
          <Route path="/login/doctor" element={<DoctorLoginPage />} />
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/:appointmentId/review"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientReviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors/:doctorId/reviews"
            element={
              <ProtectedRoute roles={['patient']}>
                <DoctorReviewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorProfileSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/settings/profile"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorProfileSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/settings/consultation"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorConsultationSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminProfileSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/doctors/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDoctorDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/patients/:id"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPatientDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/:appointmentId/chat"
            element={
              <ProtectedRoute roles={['patient', 'doctor']}>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/:appointmentId/prescription"
            element={
              <ProtectedRoute roles={['patient', 'doctor']}>
                <PrescriptionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
