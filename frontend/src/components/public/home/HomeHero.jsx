import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, MapPin } from 'lucide-react';

const HomeHero = () => {
  const { user } = useAuth();
  return (
    <section className="bg-blue-50 py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Report. <span className="text-blue-600">Track.</span> Resolve.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg">
              SAMADHAN connects citizens, authorities and field workers through a structured civic issue resolution workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined} className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Report an Issue
                <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/how-it-works" className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                See How It Works
              </Link>
            </div>
          </div>
          
          <div className="relative hidden lg:block h-[400px] w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-blue-50/30 rounded-2xl" />
            <div className="relative h-full w-full flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 w-64 z-10">
                    <div className="bg-red-100 p-2 rounded-full"><MapPin className="text-red-600 h-5 w-5" /></div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Reported</div>
                      <div className="font-semibold text-gray-900 text-sm">Pothole on Main St</div>
                    </div>
                  </div>
               </div>
               
               <div className="absolute left-1/2 top-16 bottom-16 w-1 bg-gradient-to-b from-red-200 via-blue-200 to-green-200 rounded-full transform -translate-x-1/2"></div>
               
               <div className="flex justify-end items-end relative z-10">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 w-64">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-medium text-right">Resolved</div>
                      <div className="font-semibold text-gray-900 text-sm text-right">Road Repaired</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full"><ArrowRight className="text-green-600 h-5 w-5" /></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
