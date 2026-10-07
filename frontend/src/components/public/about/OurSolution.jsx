import React from "react";
import { Layers, Workflow, Camera, Eye, ArrowUpRight } from "lucide-react";

const OurSolution = () => {
  const pillars = [
    {
      number: "01",
      title: "One Platform",
      description: "Connect civic stakeholders in one system.",
      icon: Layers,
    },
    {
      number: "02",
      title: "Structured Workflow",
      description: "Move issues through clearly defined stages.",
      icon: Workflow,
    },
    {
      number: "03",
      title: "Evidence-Based Progress",
      description: "Use photos, videos, location, and verification.",
      icon: Camera,
    },
    {
      number: "04",
      title: "Transparent Resolution",
      description: "Make progress easier to understand and track.",
      icon: Eye,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#F5F7FA] py-14 sm:py-18 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <span className="inline-flex items-center rounded-full border border-[#D7E0EA] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">
              Our Solution
            </span>

            <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0B1F3A] sm:text-5xl">
              Turning civic
              <br />
              <span className="text-[#0F9D8A]">action into a system.</span>
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-7 text-[#64748B] sm:text-lg">
            SAMADHAN approaches civic issue resolution through a structured
            methodology designed to connect people, evidence, workflows, and
            accountability in one place.
          </p>
        </div>

        {/* Main visual */}
        <div className="mt-12 overflow-hidden rounded-[28px] border border-[#DDE5ED] bg-white shadow-[0_12px_40px_rgba(11,31,58,0.06)]">
          {/* Top strip */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F9D8A]">
                The SAMADHAN approach
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                Four foundations working together.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
              <span className="h-2 w-2 rounded-full bg-[#0F9D8A]" />
              Connected
              <span className="mx-1 text-[#CBD5E1]">•</span>
              Structured
              <span className="mx-1 text-[#CBD5E1]">•</span>
              Verifiable
            </div>
          </div>

          {/* Architecture */}
          <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
            {/* Left visual block */}
            <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#0B1F3A] p-8 sm:p-12">
              {/* Decorative rings */}
              <div className="absolute h-56 w-56 rounded-full border border-white/10" />
              <div className="absolute h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute h-24 w-24 rounded-full border border-[#0F9D8A]/40" />

              {/* Center */}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black tracking-tight text-white">
                    S
                  </div>
                  <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8BE1D4]">
                    Samadhan
                  </div>
                </div>
              </div>

              {/* Orbit dots */}
              <span className="absolute left-[24%] top-[28%] h-2.5 w-2.5 rounded-full bg-[#0F9D8A]" />
              <span className="absolute right-[24%] top-[28%] h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              <span className="absolute bottom-[25%] left-[30%] h-2.5 w-2.5 rounded-full bg-white/70" />
              <span className="absolute bottom-[25%] right-[30%] h-2.5 w-2.5 rounded-full bg-[#0F9D8A]" />

              <div className="absolute bottom-5 left-6 text-xs font-medium text-white/50">
                One connected civic ecosystem
              </div>
            </div>

            {/* Right capabilities */}
            <div>
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;

                return (
                  <div
                    key={pillar.number}
                    className={`group flex items-center gap-5 px-5 py-6 transition-colors duration-300 hover:bg-[#F8FAFC] sm:px-8 ${
                      index !== pillars.length - 1
                        ? "border-b border-[#E2E8F0]"
                        : ""
                    }`}
                  >
                    {/* Number */}
                    <span className="hidden w-7 shrink-0 text-xs font-bold tracking-wider text-[#CBD5E1] sm:block">
                      {pillar.number}
                    </span>

                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0F7F6] text-[#0F9D8A] transition-all duration-300 group-hover:bg-[#0F9D8A] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-[#0F172A] sm:text-lg">
                        {pillar.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[#64748B]">
                        {pillar.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0F9D8A]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748B]">
            Built to make civic resolution more coordinated, accountable, and
            visible.
          </p>

          <div className="h-px flex-1 bg-[#DDE5ED] sm:ml-6" />
        </div>
      </div>
    </section>
  );
};

export default OurSolution;
