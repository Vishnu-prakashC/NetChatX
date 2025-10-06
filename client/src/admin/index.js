import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './Login';
import Dashboard from './Dashboard';
import UsersList from './UsersList';
import UserDetails from './UserDetails';

function RequireAdmin({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" />;
  return children;
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin onLogin={user => { setAdmin(user); navigate('/admin/dashboard'); }} />} />
      <Route path="/admin/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><UsersList /></RequireAdmin>} />
      <Route path="/admin/users/:id" element={<RequireAdmin><UserDetails /></RequireAdmin>} />
    </Routes>
  );
}
