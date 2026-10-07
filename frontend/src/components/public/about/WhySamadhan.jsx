import React from "react";
import {
  MapPin,
  Search,
  FileText,
  Wrench,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const WhySamadhan = () => {
  const steps = [
    {
      number: "01",
      icon: MapPin,
      title: "Issue Appears",
      description: "A civic problem becomes visible in the community.",
    },
    {
      number: "02",
      icon: Search,
      title: "Citizen Notices",
      description: "Someone identifies the problem and raises a report.",
    },
    {
      number: "03",
      icon: FileText,
      title: "Authorities Review",
      description: "The report is checked and prepared for action.",
    },
    {
      number: "04",
      icon: Wrench,
      title: "Work Happens",
      description: "The right field worker is assigned to resolve it.",
    },
    {
      number: "05",
      icon: CheckCircle,
      title: "Verified Resolution",
      description: "Completed work is checked before closure.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-14 sm:py-18 lg:py-20">
      {/* Subtle decorative element */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[30%] bg-gradient-to-l from-[#F5F7FA] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial heading */}
        <div className="grid items-end gap-8 border-b border-[#E2E8F0] pb-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
              Why SAMADHAN?
            </p>

            <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0B1F3A] sm:text-5xl lg:text-6xl">
              Civic problems need
              <br />
              <span className="text-[#0F9D8A]">more than a report.</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="text-base leading-7 text-[#64748B] sm:text-lg">
              SAMADHAN creates a structured path between the moment a problem is
              noticed and the moment its resolution is verified.
            </p>
          </div>
        </div>

        {/* Big visual statement */}
        <div className="flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-1 rounded-full bg-[#0F9D8A]" />

            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                One connected journey
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                Every stage has a clear responsibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold text-[#0B1F3A]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B1F3A] text-xs text-white">
              5
            </span>
            Connected stages
          </div>
        </div>

        {/* Journey */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[30px] hidden h-px bg-[#CBD5E1] lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="group relative">
                  {/* Number + icon */}
                  <div className="relative z-10 mb-6 flex items-center justify-between lg:justify-start">
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#CBD5E1] bg-white transition-all duration-300 group-hover:border-[#0F9D8A] group-hover:bg-[#0F9D8A] group-hover:shadow-[0_8px_25px_rgba(15,157,138,0.2)]">
                      <Icon className="h-5 w-5 text-[#0B1F3A] transition-colors duration-300 group-hover:text-white" />
                    </div>

                    <span className="text-xs font-bold tracking-widest text-[#CBD5E1] lg:hidden">
                      {step.number}
                    </span>
                  </div>

                  {/* Step number */}
                  <p className="hidden text-xs font-bold tracking-[0.18em] text-[#94A3B8] lg:block">
                    {step.number}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-[#0F172A]">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#64748B]">
                    {step.description}
                  </p>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute right-[-12px] top-[22px] hidden h-4 w-4 text-[#CBD5E1] lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-12 border-t border-[#E2E8F0] pt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Instead of leaving citizens wondering what happened after a
              report, SAMADHAN makes the entire journey structured and visible.
            </p>

            <div className="flex items-center gap-2 whitespace-nowrap text-sm font-bold text-[#0B1F3A]">
              Report
              <ArrowRight className="h-4 w-4 text-[#0F9D8A]" />
              Review
              <ArrowRight className="h-4 w-4 text-[#0F9D8A]" />
              Resolve
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySamadhan;
