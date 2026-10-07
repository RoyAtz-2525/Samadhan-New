import React from 'react';
import { BarChart3 } from 'lucide-react';

const CommunityImpact = () => {
  return (
    <section className="py-12 md:py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Community Impact
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Visualizing the progress and categories of civic improvement over time.
          </p>
        </div>

        {/* Empty state container for future chart integration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <BarChart3 className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Resolution Activity by Category</h3>
            <p className="text-slate-500 text-sm text-center">Charts will populate dynamically based on live API data.</p>
          </div>
          
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <BarChart3 className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Monthly Resolution Trends</h3>
            <p className="text-slate-500 text-sm text-center">Charts will populate dynamically based on live API data.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;