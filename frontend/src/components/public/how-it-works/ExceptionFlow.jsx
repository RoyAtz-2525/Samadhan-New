import React from 'react';
import { AlertTriangle, CornerDownRight } from 'lucide-react';

const ExceptionFlow = () => {
  const exceptions = [
    {
      title: "Admin Rejects Issue",
      result: "The issue does not proceed to assignment. It is marked rejected with a reason."
    },
    {
      title: "Worker Rejects Assignment",
      result: "The manager can handle the assignment accordingly and re-assign a different worker."
    },
    {
      title: "Before-Work Verification Rejected",
      result: "Work does not proceed until the required verification process is satisfied or revised."
    },
    {
      title: "After-Work Verification Rejected",
      result: "Issue remains in the appropriate work-completion state and corrective action or revision may be required."
    },
    {
      title: "Payment Failure",
      result: "Payment can be retried without changing the resolved issue state."
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-3 mb-12">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            If Something Needs Correction
          </h2>
        </div>
        
        <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          The workflow can seamlessly handle unsuccessful stages. Depending on the stage, the item may be rejected, sent back for revision, or require further action.
        </p>

        <div className="space-y-4">
          {exceptions.map((ex, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-full sm:w-1/2 font-bold text-gray-900 text-lg mb-2 sm:mb-0">
                {ex.title}
              </div>
              <div className="hidden sm:flex items-center justify-center w-12 text-gray-400">
                <CornerDownRight className="h-6 w-6" />
              </div>
              <div className="w-full sm:w-1/2 text-gray-600 sm:pl-4 border-l-0 sm:border-l-2 border-gray-200 pt-2 sm:pt-0">
                {ex.result}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExceptionFlow;
