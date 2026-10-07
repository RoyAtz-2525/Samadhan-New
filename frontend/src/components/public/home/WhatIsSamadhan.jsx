import React, { useEffect, useRef, useState } from "react";
import {
  User,
  ShieldCheck,
  BriefcaseBusiness,
  HardHat,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const WhatIsSamadhan = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const roles = [
    {
      icon: User,
      title: "Citizen",
      action: "Reports issue",
      number: "01",
    },
    {
      icon: ShieldCheck,
      title: "Admin",
      action: "Reviews & approves",
      number: "02",
    },
    {
      icon: BriefcaseBusiness,
      title: "Manager",
      action: "Allocates & verifies",
      number: "03",
    },
    {
      icon: HardHat,
      title: "Worker",
      action: "Executes work",
      number: "04",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0B1F3A] py-14 sm:py-16 lg:py-20"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-[#0F9D8A]/15 blur-[110px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#3B82F6]/12 blur-[110px]" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER — CENTER ALIGNED ================= */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5ED6C5]/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#5ED6C5]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5ED6C5]">
              One Connected Platform
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-[#5ED6C5] to-transparent" />
          </div>

          <h2 className="text-[1.85rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-white sm:text-4xl lg:text-[3rem]">
            What is{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#5ED6C5]">SAMADHAN</span>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#5ED6C5]/30" />
            </span>
            ?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-white/60 sm:text-base">
            One structured workflow that connects citizens, authorities and
            field workers — from the first report to verified resolution.
          </p>
        </div>

        {/* ================= WORKFLOW NETWORK ================= */}
        <div className="relative mt-14 sm:mt-16">
          {/* ============ DESKTOP: CURVED CONNECTOR ============ */}
          <svg
            className="pointer-events-none absolute inset-x-0 top-10 hidden h-24 w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 100"
          >
            <path
              d="M 125 50 Q 250 20 375 50 T 625 50 T 875 50"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 125 50 Q 250 20 375 50 T 625 50 T 875 50"
              stroke="#5ED6C5"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6 12"
              className={`transition-opacity duration-1000 ${
                visible ? "opacity-90" : "opacity-0"
              }`}
              style={{
                animation: visible ? "flowLine 3s linear infinite" : "none",
              }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0F9D8A" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#5ED6C5" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0F9D8A" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* ============ ROLE NODES ============ */}
          <div className="grid gap-6 md:grid-cols-4 md:gap-4">
            {roles.map((role, index) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  style={{ transitionDelay: `${index * 120}ms` }}
                  className={`group relative transition-all duration-700 ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-6 opacity-0"
                  }`}
                >
                  <div className="relative flex flex-col items-center text-center">
                    {/* Icon container with ring */}
                    <div className="relative">
                      <span className="absolute inset-0 -m-1 rounded-2xl border border-[#5ED6C5]/20 opacity-0 transition-all duration-700 group-hover:-m-2 group-hover:opacity-100" />

                      <div className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#5ED6C5]/50">
                        <Icon className="h-7 w-7 text-[#5ED6C5] transition-transform duration-300 group-hover:scale-110" />
                      </div>

                      <span className="absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#0B1F3A] bg-[#5ED6C5] font-mono text-[10px] font-bold text-[#0B1F3A]">
                        {role.number}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="mt-5">
                      <p className="text-base font-bold tracking-tight text-white">
                        {role.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/50">
                        {role.action}
                      </p>
                    </div>
                  </div>

                  {/* Mobile arrow */}
                  {index < roles.length - 1 && (
                    <div className="mt-5 flex items-center justify-center md:hidden">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                        <ArrowRight className="h-4 w-4 rotate-90 text-[#5ED6C5]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM PROCESS RIBBON ================= */}
        <div
          className={`mx-auto mt-14 max-w-5xl transition-all duration-700 delay-500 sm:mt-16 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#0F9D8A] via-[#5ED6C5] to-[#0F9D8A]" />

            <div className="flex flex-col items-center gap-4 px-6 py-5 sm:flex-row sm:justify-between sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F9D8A]/20">
                  <CheckCircle2 className="h-4 w-4 text-[#5ED6C5]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    The complete journey
                  </p>
                  <p className="text-sm font-bold text-white">
                    Report → Resolution
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {["Report", "Review", "Assign", "Execute", "Resolve"].map(
                  (step, i) => (
                    <React.Fragment key={step}>
                      <span className="text-[12px] font-semibold text-white/70">
                        {step}
                      </span>
                      {i < 4 && (
                        <ArrowRight className="h-3 w-3 text-[#5ED6C5]/60" />
                      )}
                    </React.Fragment>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flowLine {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -36; }
        }
      `}</style>
    </section>
  );
};

export default WhatIsSamadhan;
