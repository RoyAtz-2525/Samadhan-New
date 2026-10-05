import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Map, Users, ArrowRight } from 'lucide-react';

const CivicConnectHero = () => {
  const { user } = useAuth();
  return (
    <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Map className="h-8 w-8 text-blue-300" />
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <Users className="h-8 w-8 text-indigo-300" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            See Your Community.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Follow the Change.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto mb-10">
            Explore public civic activity, understand issue progress and see how reported problems move toward resolution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined} className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-white transition-colors shadow-lg">
              Report an Issue
            </Link>
            <Link to="/how-it-works" className="inline-flex justify-center items-center px-6 py-3 border border-white/30 text-base font-medium rounded-md text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-white transition-colors">
              How It Works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
    </section>
  );
};

export default CivicConnectHero;
