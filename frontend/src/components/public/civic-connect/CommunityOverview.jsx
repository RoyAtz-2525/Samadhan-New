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
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100'
    }
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Community Overview
          </h2>
          <p className="text-gray-600">
            A snapshot of civic issues across all categories in the system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className={`rounded-2xl border ${metric.borderColor} p-6 ${metric.bgColor} flex flex-col items-center justify-center text-center`}>
              <div className={`${metric.color} mb-4`}>
                <metric.icon className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {metric.title}
              </h3>
              {/* API-ready placeholder state */}
              <div className="text-2xl font-bold text-gray-900 opacity-50 flex items-center justify-center h-10">
                —
              </div>
              <p className="text-xs text-gray-500 mt-2">Data will appear here</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityOverview;
