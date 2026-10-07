import React from 'react';
import { User, Shield, Briefcase, HardHat, Settings } from 'lucide-react';

const WorkflowStep = ({ step, isLeft }) => {
  const getRoleColor = (role) => {
    if (role.includes('CITIZEN')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (role.includes('ADMIN')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (role.includes('MANAGER')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (role.includes('WORKER')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getRoleIcon = (role) => {
    if (role.includes('CITIZEN')) return <User className="w-5 h-5" />;
    if (role.includes('ADMIN')) return <Shield className="w-5 h-5" />;
    if (role.includes('MANAGER')) return <Briefcase className="w-5 h-5" />;
    if (role.includes('WORKER')) return <HardHat className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />;
  };

  return (
    <div className={"relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"}>
      
      {/* Icon Node */}
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl border-4 border-slate-50 bg-[#0B1F3A] shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white z-10 font-black text-sm transition-transform duration-300 group-hover:scale-110">
        {step.id}
      </div>
      
      {/* Content Card */}
      <div className={"w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-100 transition-all duration-300"}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={"flex items-center space-x-1.5 px-4 py-1.5 rounded-xl border text-xs font-black tracking-widest uppercase " + getRoleColor(step.role)}>
            {getRoleIcon(step.role)}
            <span>{step.role}</span>
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
        <p className="text-slate-600 mb-6 text-base leading-relaxed">{step.action}</p>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5">Resulting State</div>
          <div className="text-sm font-bold text-slate-800">{step.result}</div>
        </div>
      </div>
      
    </div>
  );
};

export default WorkflowStep;

