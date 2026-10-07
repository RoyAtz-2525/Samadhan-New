import React from 'react';
import { Activity } from 'lucide-react';

const RecentCivicActivity = () => {
  return (
    <section className="py-12 md:py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-10">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
             <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recent Civic Activity
          </h2>
        </div>

        {/* Empty state container for future API data */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 mb-6 shadow-inner">
            <Activity className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            Activity Feed Pending
          </h3>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Recent civic activity will stream here once connected to the backend.
          </p>
          
          <div className="mt-10 pt-10 border-t border-slate-100 flex flex-wrap justify-center gap-3 text-sm font-bold text-slate-400">
            <span className="flex items-center mr-2 text-slate-500 uppercase tracking-widest text-xs">Expected Data Fields:</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">Activity Type</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">Category</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">Area</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">Time</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentCivicActivity;