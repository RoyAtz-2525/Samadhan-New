import React from 'react';
import { Activity } from 'lucide-react';

const RecentCivicActivity = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 mb-8">
          <Activity className="h-7 w-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Recent Civic Activity
          </h2>
        </div>

        {/* Empty state container for future API data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Activity Feed Pending
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Recent civic activity (such as Issue Reported, Work Started, Issue Resolved) will appear here once the system is connected to real-time public-safe backend activity.
          </p>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-4 text-xs font-medium text-gray-400">
            <span>Expected Fields:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Activity Type</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Category</span>
            <span className="bg-gray-100 px-2 py-1 rounded">General Area</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Timestamp</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentCivicActivity;
