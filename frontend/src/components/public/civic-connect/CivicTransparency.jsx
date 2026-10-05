import React from 'react';
import { ArrowDown } from 'lucide-react';

const CivicTransparency = () => {
  const lifecycle = [
    { name: "REPORTED", color: "bg-gray-100 text-gray-600" },
    { name: "REVIEWED", color: "bg-indigo-100 text-indigo-700" },
    { name: "APPROVED", color: "bg-blue-100 text-blue-700" },
    { name: "ASSIGNED", color: "bg-purple-100 text-purple-700" },
    { name: "IN PROGRESS", color: "bg-amber-100 text-amber-700" },
    { name: "VERIFIED", color: "bg-teal-100 text-teal-700" },
    { name: "RESOLVED", color: "bg-green-100 text-green-700" }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
          Civic Transparency
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Civic Connect is intended to make civic progress easier for communities to understand. Issues follow a strict lifecycle, and public statuses reflect real-world progression without exposing private data or internal audit logs.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
          {lifecycle.map((stage, idx) => (
            <React.Fragment key={idx}>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider whitespace-nowrap ${stage.color}`}>
                {stage.name}
              </div>
              {idx < lifecycle.length - 1 && (
                <div className="text-gray-300">
                  <ArrowDown className="h-5 w-5 sm:-rotate-90" />
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
