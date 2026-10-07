import React from 'react';
import { Eye, ShieldCheck, Accessibility, Camera, Users } from 'lucide-react';

const OurPrinciples = () => {
  const principles = [
    {
      title: 'Transparency',
      description: 'Clear visibility into the status of civic reports at every stage. We ensure that no report gets lost in the void.',
      icon: Eye,
      color: 'text-[#0F9D8A]',
      bg: 'bg-[#0F9D8A]/10'
    },
    {
      title: 'Accountability',
      description: 'Ensuring responsible parties are assigned and tracked. Every action has a clear owner and timeline.',
      icon: ShieldCheck,
      color: 'text-[#3B82F6]',
      bg: 'bg-[#3B82F6]/10'
    },
    {
      title: 'Accessibility',
      description: 'Making the reporting process straightforward for everyone, regardless of technical expertise.',
      icon: Accessibility,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10'
    },
    {
      title: 'Evidence-Based',
      description: 'Relying on media and location data to verify claims and fixes, ensuring work is genuinely completed.',
      icon: Camera,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10'
    },
    {
      title: 'Community Driven',
      description: 'Fostering collaboration between citizens and local authorities to build better neighborhoods together.',
      icon: Users,
      color: 'text-[#16A34A]',
      bg: 'bg-[#16A34A]/10'
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Sticky Header Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <span className="mb-3 block text-sm font-semibold uppercase tracking-wider text-[#0F9D8A]">
                Core Values
              </span>
              <h2 className="text-3xl font-extrabold text-[#0B1F3A] sm:text-4xl lg:text-5xl">
                Our Principles
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-[#64748B]">
                The fundamental values guiding the design, operation, and future of the SAMADHAN platform.
              </p>
              
              <div className="mt-10 h-1 w-20 rounded-full bg-[#E2E8F0]" />
            </div>
          </div>

          {/* Scrolling Content Column */}
          <div className="lg:col-span-7">
            <div className="space-y-12">
              {principles.map((principle, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${principle.bg} ${principle.color}`}>
                      <principle.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold text-[#0F172A]">{principle.title}</h3>
                    <p className="text-lg leading-relaxed text-[#64748B]">{principle.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default OurPrinciples;
