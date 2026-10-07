import React from 'react';
import { ArrowRight, AlertCircle, FileCheck, CheckCircle, UserCheck, Search, HardHat, Eye, Star, CreditCard } from 'lucide-react';

const WorkflowOverview = () => {
  const steps = [
    { num: '01', title: 'Report', icon: AlertCircle },
    { num: '02', title: 'Review', icon: Search },
    { num: '03', title: 'Assign', icon: UserCheck },
    { num: '04', title: 'Accept', icon: FileCheck },
    { num: '05', title: 'Verify', icon: Eye },
    { num: '06', title: 'Work', icon: HardHat },
    { num: '07', title: 'Verify', icon: Eye },
    { num: '08', title: 'Resolve', icon: CheckCircle },
    { num: '09', title: 'Pay', icon: CreditCard },
    { num: '10', title: 'Feedback', icon: Star }
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-50 border-b border-slate-100 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-[1000px]">
        <div className="flex items-center justify-between space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 group">
                <div className="bg-white border border-slate-200 h-14 w-14 rounded-2xl flex items-center justify-center mb-4 text-slate-400 shadow-sm relative z-10 group-hover:border-teal-300 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all duration-300 hover:-translate-y-1">
                  <step.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="text-xs font-black text-slate-300 mb-1 tracking-widest">{step.num}</div>
                <div className="text-sm font-bold text-slate-700 tracking-tight">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 mb-8 relative">
                  <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-5 w-5 text-slate-300" strokeWidth={2} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowOverview;