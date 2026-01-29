import React from 'react';
import RoleLoginPage from './RoleLoginPage.jsx';

export default function PatientLoginPage() {
  return (
    <RoleLoginPage
      role="patient"
      title="Patient Login"
      subtitle="Book appointments and consult verified doctors online."
    />
  );
}
