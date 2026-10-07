import React from 'react';
import { AlertCircle, Search, HardHat, CheckCircle2 } from 'lucide-react';

const CommunityOverview = () => {
  const metrics = [
    {
      title: 'Reported',
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Under Review',
      icon: Search,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'In Progress',
      icon: HardHat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Resolved',
      icon: CheckCircle2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100'
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Community Overview
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A real-time snapshot of civic issues across all categories in the system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className={"rounded-3xl border " + metric.borderColor + " p-8 " + metric.bgColor + " flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg"}>
              <div className={"h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6 " + metric.color}>
                <metric.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">
                {metric.title}
              </h3>
              {/* API-ready placeholder state */}
              <div className="text-4xl font-extrabold text-slate-900 opacity-20 flex items-center justify-center">
                ?"
              </div>
              <p className="text-sm font-medium text-slate-500 mt-4 bg-white/50 px-3 py-1 rounded-full">Pending Data</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityOverview;
