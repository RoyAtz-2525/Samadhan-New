import React from 'react';
import { BarChart3 } from 'lucide-react';

const CommunityImpact = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Community Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Visualizing the progress and categories of civic improvement.
          </p>
        </div>

        {/* Empty state container for future chart integration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-semibold mb-2">Resolution Activity by Category</h3>
            <p className="text-gray-500 text-sm text-center">Community impact data will appear here.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-semibold mb-2">Monthly Resolution Trends</h3>
            <p className="text-gray-500 text-sm text-center">Community impact data will appear here.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;
