import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <img src="/logo.png" alt="Samadhan Logo" className="h-16 mb-4" />
      <p className="text-xl text-gray-600 mb-8">Civic Issue Reporting and Resolution Platform</p>
      <div className="space-x-4">
        {!user ? (
          <>
            <Link to="/login" className="bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Report an Issue</Link>
          </>
        ) : (
          <Link to="/citizen/report-issue" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">Report an Issue</Link>
        )}
      </div>
    </div>
  );
};

export default Landing;
