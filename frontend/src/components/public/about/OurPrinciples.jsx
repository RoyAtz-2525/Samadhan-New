import React from 'react';
import { Eye, ShieldCheck, Accessibility, Camera, Users } from 'lucide-react';

const OurPrinciples = () => {
  const principles = [
    {
      title: 'Transparency',
      description: 'Clear visibility into the status of civic reports at every stage.',
      icon: Eye
    },
    {
      title: 'Accountability',
      description: 'Ensuring responsible parties are assigned and tracked.',
      icon: ShieldCheck
    },
    {
      title: 'Accessibility',
      description: 'Making the reporting process straightforward for everyone.',
      icon: Accessibility
    },
    {
      title: 'Evidence',
      description: 'Relying on media and location data to verify claims and fixes.',
      icon: Camera
    },
    {
      title: 'Community',
      description: 'Fostering collaboration between citizens and local authorities.',
      icon: Users
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 border-l-4 border-blue-600 pl-6">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Our Principles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            The core values guiding the design and operation of the SAMADHAN platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {principles.map((principle, index) => (
            <div key={index} className="flex space-x-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <principle.icon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{principle.title}</h3>
                <p className="text-gray-600 text-sm">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPrinciples;
