import React from 'react';
import { Users, Shield, Briefcase, HardHat, ArrowRight } from 'lucide-react';

const WhoWeConnect = () => {
  const roles = [
    {
      title: 'CITIZENS',
      description: 'Report civic issues and follow their progress.',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'ADMINISTRATORS',
      description: 'Review and verify reported issues.',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'MANAGERS',
      description: 'Coordinate approved work and field assignments.',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'FIELD WORKERS',
      description: 'Execute assigned work and provide progress evidence.',
      icon: HardHat,
      color: 'bg-orange-100 text-orange-700',
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Who SAMADHAN Connects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A structured civic platform relies on clear roles and responsibilities.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
          {roles.map((role, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-auto hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-lg ${role.color} mb-4`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </div>
              {index < roles.length - 1 && (
                <div className="hidden lg:flex items-center text-gray-300">
                  <ArrowRight className="h-8 w-8" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeConnect;
