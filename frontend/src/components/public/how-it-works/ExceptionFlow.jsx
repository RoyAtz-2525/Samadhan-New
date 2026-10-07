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
    <section className="py-12 md:py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="bg-red-100 p-3 rounded-xl text-red-600">
             <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Exception Handling
          </h2>
        </div>
        
        <p className="text-lg text-slate-600 mb-12 max-w-2xl">
          The workflow gracefully handles unsuccessful stages. Depending on the step, an item may be rejected, sent back for revision, or require further action.
        </p>

        <div className="space-y-4 relative">
          {/* Vertical line indicator */}
          <div className="absolute left-[2.25rem] top-8 bottom-8 w-px bg-slate-200 hidden sm:block"></div>
          
          {exceptions.map((ex, idx) => (
            <div key={idx} className="relative flex flex-col sm:flex-row items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-full sm:w-1/2 font-bold text-slate-900 text-lg mb-2 sm:mb-0 relative z-10">
                {ex.title}
              </div>
              <div className="hidden sm:flex items-center justify-center w-12 text-slate-300 group-hover:text-red-400 transition-colors z-10 bg-white">
                <CornerDownRight className="h-6 w-6" />
              </div>
              <div className="w-full sm:w-1/2 text-slate-600 sm:pl-4 sm:border-l-0 pt-2 sm:pt-0 z-10">
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