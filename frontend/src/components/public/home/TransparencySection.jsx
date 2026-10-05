import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TransparencySection = () => {
  const lifecycle = [
    'Reported', 'Under Review', 'Approved', 'Assigned', 'Work Started', 'Verified', 'Resolved'
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
              Total Transparency
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Unlike traditional systems where complaints disappear into a black box, SAMADHAN exposes the entire issue lifecycle visually.
            </p>
            <p className="text-lg text-gray-600">
              Each stage provides structured progress and accountability, ensuring you always know exactly who is responsible for the next step.
            </p>
          </div>
          
          <div className="w-full lg:w-1/2 bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="space-y-4">
              {lifecycle.map((stage, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className={`h-6 w-6 ${i === lifecycle.length - 1 ? 'text-green-500' : 'text-blue-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
                       <div className={`h-full rounded-full ${i === lifecycle.length - 1 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;
