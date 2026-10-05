import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

const MissionVision = () => {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="relative p-8 rounded-2xl bg-blue-600 text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-blue-500 opacity-20">
              <Target className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-8 w-8 text-blue-200" />
                <h2 className="text-3xl font-extrabold tracking-tight">Mission</h2>
              </div>
              <p className="text-xl leading-relaxed text-blue-50 font-medium">
                Make civic issue reporting and resolution more structured, transparent, and accessible.
              </p>
            </div>
          </div>

          <div className="relative p-8 rounded-2xl bg-gray-900 text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 text-gray-800 opacity-50">
              <Lightbulb className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Lightbulb className="h-8 w-8 text-gray-400" />
                <h2 className="text-3xl font-extrabold tracking-tight">Vision</h2>
              </div>
              <p className="text-xl leading-relaxed text-gray-300 font-medium">
                Build a connected civic ecosystem where communities and civic teams can work together with greater visibility and accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
