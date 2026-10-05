import React from 'react';
import { User, Shield, Briefcase, HardHat, Settings } from 'lucide-react';

const WorkflowStep = ({ step, isLeft }) => {
  const getRoleColor = (role) => {
    if (role.includes('CITIZEN')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (role.includes('ADMIN')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role.includes('MANAGER')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role.includes('WORKER')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleIcon = (role) => {
    if (role.includes('CITIZEN')) return <User className="w-5 h-5" />;
    if (role.includes('ADMIN')) return <Shield className="w-5 h-5" />;
    if (role.includes('MANAGER')) return <Briefcase className="w-5 h-5" />;
    if (role.includes('WORKER')) return <HardHat className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />;
  };

  return (
    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
      
      {/* Icon Node */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white z-10 font-bold text-sm">
        {step.id}
      </div>
      
      {/* Content Card */}
      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-bold ${getRoleColor(step.role)}`}>
            {getRoleIcon(step.role)}
            <span>{step.role}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{step.action}</p>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Resulting State</div>
          <div className="text-sm font-medium text-gray-900">{step.result}</div>
        </div>
      </div>
      
    </div>
  );
};

export default WorkflowStep;
