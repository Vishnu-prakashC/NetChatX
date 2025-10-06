import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' }
];

export default function AdminNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-gray-800 text-white w-48 min-h-screen flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">Admin</div>
      <ul className="flex-1">
        {navItems.map(item => (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`block px-4 py-2 hover:bg-gray-700 ${pathname.startsWith(item.to) ? 'bg-gray-700' : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full bg-red-600 hover:bg-red-700 py-1 rounded"
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.href = '/admin/login';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

