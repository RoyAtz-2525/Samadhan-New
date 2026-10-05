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
    <section className="py-12 bg-white border-b border-gray-100 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-[800px]">
        <div className="flex items-center justify-between space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1">
                <div className="bg-gray-50 border border-gray-200 h-12 w-12 rounded-full flex items-center justify-center mb-3 text-blue-600 shadow-sm relative z-10 group hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-1">{step.num}</div>
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mb-6 relative">
                  <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-4 w-4 text-gray-300" />
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
