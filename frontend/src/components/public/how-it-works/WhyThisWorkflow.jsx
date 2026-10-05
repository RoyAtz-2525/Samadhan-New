import React from 'react';
import { UserCheck, Waypoints, Camera, Briefcase, SplitSquareHorizontal, History } from 'lucide-react';

const WhyThisWorkflow = () => {
  const principles = [
    {
      title: "Clear Responsibility",
      desc: "Every stage has a responsible role.",
      icon: UserCheck
    },
    {
      title: "Structured Progress",
      desc: "Issues move through defined states.",
      icon: Waypoints
    },
    {
      title: "Evidence-Based Verification",
      desc: "Photos, videos and location can support field verification.",
      icon: Camera
    },
    {
      title: "Controlled Assignment",
      desc: "Managers coordinate workers instead of assigning work arbitrarily.",
      icon: Briefcase
    },
    {
      title: "Separation of Work & Verification",
      desc: "The worker performs the work; the manager verifies the result.",
      icon: SplitSquareHorizontal
    },
    {
      title: "Operational Transparency",
      desc: "Progress can be represented through issue status and history.",
      icon: History
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Why This Workflow?
          </h2>
          <p className="text-lg text-gray-600">
            Our design principles ensure accountability and clear operational boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((item, idx) => (
            <div key={idx} className="bg-blue-50 p-8 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
              <div className="bg-white h-12 w-12 rounded-xl flex items-center justify-center shadow-sm mb-6 text-blue-600">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyThisWorkflow;
