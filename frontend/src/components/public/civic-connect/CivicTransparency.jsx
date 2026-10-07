import React from 'react';
import { ArrowDown } from 'lucide-react';

const CivicTransparency = () => {
  const lifecycle = [
    { name: "REPORTED", color: "bg-slate-100 text-slate-700 border border-slate-200" },
    { name: "REVIEWED", color: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
    { name: "APPROVED", color: "bg-blue-50 text-blue-700 border border-blue-200" },
    { name: "ASSIGNED", color: "bg-purple-50 text-purple-700 border border-purple-200" },
    { name: "IN PROGRESS", color: "bg-amber-50 text-amber-700 border border-amber-200" },
    { name: "VERIFIED", color: "bg-teal-50 text-teal-700 border border-teal-200" },
    { name: "RESOLVED", color: "bg-green-50 text-green-700 border border-green-200" }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Civic Transparency
        </h2>
        <p className="text-lg text-slate-600 mb-16 max-w-2xl mx-auto leading-relaxed">
          Civic Connect ensures public processes are visible. Issues follow a strict lifecycle, and public statuses reflect real-world progression without exposing private personal data.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6">
          {lifecycle.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className={"px-5 py-3 rounded-xl text-sm font-bold tracking-widest whitespace-nowrap shadow-sm " + stage.color}>
                {stage.name}
              </div>
              {idx < lifecycle.length - 1 && (
                <div className="text-slate-300 py-2 sm:py-0">
                  <ArrowDown className="h-6 w-6 sm:-rotate-90" strokeWidth={2.5} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CivicTransparency;