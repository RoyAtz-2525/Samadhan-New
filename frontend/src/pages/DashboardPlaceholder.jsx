import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPlaceholder = ({ title }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="mb-4">Welcome, {user?.email} ({user?.role?.name})</p>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};

export default DashboardPlaceholder;
