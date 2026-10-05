import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AboutCTA = () => {
  const { user } = useAuth();
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
          Have a civic issue to report?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined} className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-md text-blue-600 bg-white hover:bg-gray-50 shadow-md transition-colors">
            Report an Issue
          </Link>
          <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-white text-lg font-bold rounded-md text-white bg-transparent hover:bg-blue-700 transition-colors">
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
