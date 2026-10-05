import React from 'react';
import { Layers, Workflow, Camera, Eye } from 'lucide-react';

const OurSolution = () => {
  const pillars = [
    {
      title: "One Platform",
      description: "Connect civic stakeholders in one system.",
      icon: Layers,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Structured Workflow",
      description: "Move issues through clearly defined stages.",
      icon: Workflow,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Evidence-Based Progress",
      description: "Use photos, videos, location, and verification.",
      icon: Camera,
      color: "text-teal-600",
      bg: "bg-teal-50"
    },
    {
      title: "Transparent Resolution",
      description: "Make progress easier to understand and track.",
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Our Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            SAMADHAN approaches civic issue resolution through a structured methodology designed to foster accountability and coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className={`${pillar.bg} ${pillar.color} h-12 w-12 rounded-xl flex items-center justify-center mb-6`}>
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{pillar.title}</h3>
              <p className="text-gray-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurSolution;
