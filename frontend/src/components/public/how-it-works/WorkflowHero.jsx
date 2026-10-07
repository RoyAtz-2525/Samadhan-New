import React from 'react';
import { GitMerge } from 'lucide-react';

const WorkflowHero = () => {
  return (
    <section className="bg-[#0B1F3A] text-white py-16 md:py-24 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 rounded-3xl mb-8 shadow-xl border border-teal-500/20 backdrop-blur-md">
            <GitMerge className="h-10 w-10 text-teal-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            From Report to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Resolution</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            See exactly how SAMADHAN moves a civic issue through reporting, review, assignment, field work, verification, and final resolution.
          </p>
        </div>
      </div>
      
      {/* Visual workflow motif background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </section>
  );
};

export default WorkflowHero;