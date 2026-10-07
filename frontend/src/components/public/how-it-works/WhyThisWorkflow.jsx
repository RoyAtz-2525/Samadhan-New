import React from 'react';
import { UserCheck, Waypoints, Camera, Briefcase, SplitSquareHorizontal, History } from 'lucide-react';

const WhyThisWorkflow = () => {
  const principles = [
    {
      title: "Clear Responsibility",
      desc: "Every stage is owned by a specific role.",
      icon: UserCheck
    },
    {
      title: "Structured Progress",
      desc: "Issues move through defined, trackable states.",
      icon: Waypoints
    },
    {
      title: "Evidence-Based",
      desc: "Photos and location support field verification.",
      icon: Camera
    },
    {
      title: "Controlled Assignment",
      desc: "Managers coordinate workers intelligently.",
      icon: Briefcase
    },
    {
      title: "Separation of Concerns",
      desc: "Workers execute; managers verify results.",
      icon: SplitSquareHorizontal
    },
    {
      title: "Operational Transparency",
      desc: "Clear progress representation through status history.",
      icon: History
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Why This Workflow?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our design principles ensure accountability, operational boundaries, and a scalable approach to civic issue resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {principles.map((item, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-default">
              <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-sm">
                <item.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyThisWorkflow;