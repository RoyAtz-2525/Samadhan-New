import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

const MissionVision = () => {
  return (
    <section className="bg-[#F5F7FA] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Mission */}
          <div className="group relative overflow-hidden rounded-[24px] bg-white p-10 shadow-sm transition-all hover:shadow-md border border-[#E2E8F0]">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#0F9D8A]/5 blur-3xl transition-transform group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F9D8A]/10 text-[#0F9D8A]">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold text-[#0B1F3A]">
                Our Mission
              </h2>
              <p className="text-lg leading-relaxed text-[#64748B]">
                To provide a centralized platform that streamlines the reporting, management, and resolution of civic issues, bridging the gap between citizens and authorities.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="group relative overflow-hidden rounded-[24px] bg-[#0B1F3A] p-10 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-[#3B82F6]/20 blur-3xl transition-transform group-hover:scale-150" />
            
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#3B82F6]">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold text-white">
                Our Vision
              </h2>
              <p className="text-lg leading-relaxed text-white/80">
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
