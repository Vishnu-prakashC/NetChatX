import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from './AdminNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <div className="flex"><AdminNav /><div className="p-8">Loading...</div></div>;

  return (
    <div className="flex">
      <AdminNav />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <div className="text-gray-500">Total Users</div>
            <div className="text-3xl font-bold">{data.totalUsers}</div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-gray-500">Active Users</div>
            <div className="text-3xl font-bold">{data.active24h}</div>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <div className="text-gray-500">Total Messages</div>
            <div className="text-3xl font-bold">{data.totalMessages}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
