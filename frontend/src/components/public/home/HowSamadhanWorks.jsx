import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { workflowSteps } from "../../../data/public/workflowSteps";

const HowSamadhanWorks = () => {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = workflowSteps.slice(0, 6);
  const total = steps.length;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      {/* Tinted top band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#F5F7FA] to-transparent" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#0B1F3A 1px, transparent 1px), linear-gradient(90deg, #0B1F3A 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 90% 20%, black, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 90% 20%, black, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* ================= LEFT: STICKY HEADING ================= */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className={`transition-all duration-700 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              <div className="mb-5 inline-flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
                  The Workflow
                </span>
                <span className="h-px w-10 bg-gradient-to-r from-[#0F9D8A] to-transparent" />
              </div>

              <h2 className="text-[1.85rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#0F172A] sm:text-4xl lg:text-[2.75rem]">
                How{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">SAMADHAN</span>
                  <span className="absolute bottom-1 left-0 h-[6px] w-full rounded-sm bg-[#0F9D8A]/25" />
                </span>{" "}
                works
              </h2>

              <p className="mt-5 max-w-md text-[14px] leading-7 text-[#64748B] sm:text-[15px]">
                A simplified, transparent workflow ensuring accountability at
                every step — from the first report to verified resolution.
              </p>

              {/* Flow summary */}
              <div className="mt-7 flex flex-wrap items-center gap-2">
                {[
                  "Report",
                  "Review",
                  "Assign",
                  "Execute",
                  "Verify",
                  "Resolve",
                ].map((label, i) => (
                  <React.Fragment key={label}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                      {label}
                    </span>
                    {i < 5 && <span className="h-px w-3 bg-[#CBD5E1]" />}
                  </React.Fragment>
                ))}
              </div>

              <div className="my-7 h-px w-full bg-gradient-to-r from-[#E2E8F0] to-transparent" />

              <Link
                to="/how-it-works"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#0B1F3A] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_10px_25px_rgba(11,31,58,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#12345B] hover:shadow-[0_14px_30px_rgba(11,31,58,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                Explore the full workflow
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#94A3B8]">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>Accountability at every step</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: NUMBERED STEPS (COMPACT) ================= */}
          <div className="relative">
            {/* Vertical guide line */}
            <div className="pointer-events-none absolute bottom-0 left-[28px] top-0 hidden w-px bg-gradient-to-b from-transparent via-[#E2E8F0] to-transparent sm:block" />

            <div className="space-y-0">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;

                return (
                  <div
                    key={step.id}
                    style={{ transitionDelay: `${index * 80}ms` }}
                    className={`group relative transition-all duration-700 ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-5 opacity-0"
                    }`}
                    onMouseEnter={() => setActiveStep(index)}
                    onFocus={() => setActiveStep(index)}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`relative flex w-full items-start gap-4 rounded-xl px-3 py-3 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9D8A] ${
                        isActive
                          ? "bg-[#F5F7FA]"
                          : "bg-transparent hover:bg-[#F5F7FA]/60"
                      }`}
                    >
                      {/* Number */}
                      <div className="relative flex w-10 shrink-0 flex-col items-center sm:w-12">
                        <span
                          className={`font-mono text-[1.65rem] font-bold leading-none tracking-tighter transition-all duration-500 sm:text-[2rem] ${
                            isActive
                              ? "text-[#0B1F3A]"
                              : "text-[#E2E8F0] group-hover:text-[#CBD5E1]"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`mt-1.5 h-1 w-1 rounded-full transition-all duration-500 ${
                            isActive
                              ? "scale-100 bg-[#0F9D8A] shadow-[0_0_0_3px_rgba(15,157,138,0.15)]"
                              : "scale-0 bg-transparent"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3
                            className={`text-[14px] font-bold leading-tight tracking-tight transition-colors duration-300 sm:text-[15px] ${
                              isActive
                                ? "text-[#0B1F3A]"
                                : "text-[#0F172A] group-hover:text-[#0B1F3A]"
                            }`}
                          >
                            {step.title}
                          </h3>

                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                              isActive
                                ? "bg-[#0B1F3A] text-white shadow-[0_4px_12px_rgba(11,31,58,0.18)]"
                                : "bg-white text-[#94A3B8] ring-1 ring-[#E2E8F0] group-hover:text-[#0F9D8A] group-hover:ring-[#0F9D8A]/30"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        </div>

                        <p
                          className={`mt-1.5 max-w-lg text-[12px] leading-5 text-[#64748B] transition-all duration-500 ${
                            isActive
                              ? "max-h-20 opacity-100"
                              : "max-h-0 overflow-hidden opacity-0 sm:max-h-20 sm:opacity-100"
                          }`}
                        >
                          {step.description}
                        </p>

                        <div
                          className={`mt-2.5 h-[2px] overflow-hidden rounded-full bg-[#E2E8F0] transition-all duration-500 ${
                            isActive ? "w-full opacity-100" : "w-0 opacity-0"
                          }`}
                        >
                          <div className="h-full w-full bg-gradient-to-r from-[#0F9D8A] to-[#3B82F6]" />
                        </div>
                      </div>
                    </button>

                    {index < total - 1 && (
                      <div className="ml-3 mr-3 h-px bg-[#E2E8F0] sm:ml-16" />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-6 flex items-center gap-3 transition-all duration-700 delay-500 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="h-px w-8 bg-[#E2E8F0]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                Report → Resolution
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowSamadhanWorks;
