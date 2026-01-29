import React from 'react';
import RoleLoginPage from './RoleLoginPage.jsx';

export default function DoctorLoginPage() {
  return (
    <RoleLoginPage
      role="doctor"
      title="Doctor Login"
      subtitle="Manage appointments, chat with patients, and upload prescriptions."
    />
  );
}
