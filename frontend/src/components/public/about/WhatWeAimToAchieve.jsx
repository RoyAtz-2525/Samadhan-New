import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const WhatWeAimToAchieve = () => {
  const goals = [
    "Better visibility into civic issues",
    "Clearer coordination between teams",
    "Structured field operations",
    "Evidence-based verification",
    "Transparent issue progress",
    "Greater citizen participation"
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
              What We Aim to Achieve
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Our platform is designed to systematically improve how civic environments are managed. We are building toward a future characterized by:
            </p>
          </div>
          
          <div>
            <ul className="space-y-6">
              {goals.map((goal, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="ml-4 text-lg text-gray-200 font-medium">
                    {goal}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeAimToAchieve;
