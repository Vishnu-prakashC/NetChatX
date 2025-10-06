import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNav from './AdminNav';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUsers(res.data.users);
      setTotal(res.data.total);
    });
  }, []);

  return (
    <div className="flex">
      <AdminNav />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-100">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">Total: {total}</div>
      </div>
    </div>
  );
}
