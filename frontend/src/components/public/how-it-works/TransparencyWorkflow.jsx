import React from 'react';
import { ChevronRight } from 'lucide-react';

const TransparencyWorkflow = () => {
  const statuses = [
    "REPORTED",
    "UNDER REVIEW",
    "APPROVED",
    "ASSIGNED",
    "WORK STARTED",
    "WORK COMPLETED",
    "UNDER VERIFICATION",
    "RESOLVED"
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
          Transparency by Design
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-16">
          The platform maintains structured status progression and verification checkpoints. Every transition is recorded securely without exposing private user information.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-y-4">
          {statuses.map((status, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wider text-blue-400 whitespace-nowrap">
                {status}
              </div>
              {idx < statuses.length - 1 && (
                <div className="px-2 text-gray-500">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransparencyWorkflow;
