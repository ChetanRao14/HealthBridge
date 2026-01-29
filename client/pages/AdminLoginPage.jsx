import React from 'react';
import RoleLoginPage from './RoleLoginPage.jsx';

export default function AdminLoginPage() {
  return (
    <RoleLoginPage
      role="admin"
      title="Admin Login"
      subtitle="Verify doctors, monitor appointments, and manage the platform."
    />
  );
}
