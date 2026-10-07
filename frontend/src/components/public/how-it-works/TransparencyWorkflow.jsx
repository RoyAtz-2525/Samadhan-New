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
    <section className="py-12 md:py-20 bg-[#0B1F3A] text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold mb-6">
          System Integrity
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Transparency by Design
        </h2>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed">
          The platform maintains structured status progression and verification checkpoints. Every transition is securely recorded, ensuring complete accountability without exposing private user information.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-y-6">
          {statuses.map((status, idx) => (
            <React.Fragment key={idx}>
              <div className="group relative">
                <div className="absolute inset-0 bg-blue-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity rounded-lg"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-blue-500/50 px-5 py-3 rounded-xl text-sm font-bold tracking-wider text-blue-400 whitespace-nowrap transition-all shadow-lg">
                  {status}
                </div>
              </div>
              {idx < statuses.length - 1 && (
                <div className="px-2 text-slate-600">
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