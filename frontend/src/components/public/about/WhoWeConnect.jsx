import React from 'react';
import { Users, Shield, Briefcase, HardHat } from 'lucide-react';

const WhoWeConnect = () => {
  const roles = [
    {
      title: 'CITIZENS',
      description: 'Report civic issues and follow their progress.',
      icon: Users,
      color: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]/10',
    },
    {
      title: 'ADMINISTRATORS',
      description: 'Review and verify reported issues.',
      icon: Shield,
      color: 'text-[#0F9D8A]',
      bg: 'bg-[#0F9D8A]/10',
    },
    {
      title: 'MANAGERS',
      description: 'Coordinate approved work and field assignments.',
      icon: Briefcase,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10',
    },
    {
      title: 'FIELD WORKERS',
      description: 'Execute assigned work and provide progress evidence.',
      icon: HardHat,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-[#0B1F3A] sm:text-4xl">
            Who SAMADHAN Connects
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#64748B]">
            A structured civic platform relies on clear roles and responsibilities.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Connecting line for desktop */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#E2E8F0] lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {roles.map((role, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`relative flex flex-col items-center lg:flex-row ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Center Node */}
                  <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-[#0B1F3A] shadow-sm lg:block" />

                  {/* Content Box */}
                  <div className={`w-full lg:w-1/2 ${isEven ? 'lg:pl-16' : 'lg:pr-16 text-left lg:text-right'}`}>
                    <div className="group relative rounded-2xl border border-[#E2E8F0] bg-[#F5F7FA] p-8 transition-colors hover:border-[#0F9D8A]/30 hover:bg-white hover:shadow-lg">
                      <div className={`mb-5 inline-flex p-4 rounded-2xl ${role.bg} ${role.color}`}>
                        <role.icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-3 text-xl font-bold tracking-tight text-[#0B1F3A]">{role.title}</h3>
                      <p className="text-base text-[#64748B]">{role.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default WhoWeConnect;
