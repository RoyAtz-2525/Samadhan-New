import React from 'react';

const ImpactStats = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Built for Measurable Civic Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SAMADHAN tracks the lifecycle of every reported issue, ensuring true accountability.
          </p>
        </div>
        
        {/* Placeholder for future API integration (No fake stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-100 h-full flex flex-col justify-center">
            <div className="text-blue-600 text-xl font-bold uppercase tracking-wider mb-2">Reported</div>
            <p className="text-gray-500 text-sm">Issues submitted by the community</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-8 text-center border border-orange-100 h-full flex flex-col justify-center">
            <div className="text-orange-600 text-xl font-bold uppercase tracking-wider mb-2">Under Review</div>
            <p className="text-gray-500 text-sm">Awaiting administrative validation</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-8 text-center border border-purple-100 h-full flex flex-col justify-center">
            <div className="text-purple-600 text-xl font-bold uppercase tracking-wider mb-2">In Progress</div>
            <p className="text-gray-500 text-sm">Currently assigned and being fixed</p>
          </div>
          <div className="bg-green-50 rounded-xl p-8 text-center border border-green-100 h-full flex flex-col justify-center">
            <div className="text-green-600 text-xl font-bold uppercase tracking-wider mb-2">Resolved</div>
            <p className="text-gray-500 text-sm">Verified as completed by authorities</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
