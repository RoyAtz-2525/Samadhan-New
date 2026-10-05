import React from 'react';
import { GitMerge } from 'lucide-react';

const WorkflowHero = () => {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-8 shadow-lg">
            <GitMerge className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            From Report to <span className="text-blue-400">Resolution</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            See how SAMADHAN moves a civic issue through reporting, review, assignment, field work, verification, and resolution.
          </p>
        </div>
      </div>
      
      {/* Visual workflow motif background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="workflow-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 50 h80 M90 50 l-10 -10 M90 50 l-10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#workflow-pattern)" />
        </svg>
      </div>
    </section>
  );
};

export default WorkflowHero;
