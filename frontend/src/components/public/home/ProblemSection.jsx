import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { reportCategories } from "../../../data/public/reportCategories";

const ProblemSection = () => {
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
      { threshold: 0.12 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      {/* soft tinted background band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#EAF7F5]/40 to-transparent" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#3B82F6]/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div
          className={`mb-12 max-w-3xl transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
              The Challenge
            </span>
            <span className="h-px w-16 bg-gradient-to-r from-[#0F9D8A] to-transparent" />
          </div>

          <h2 className="text-[1.85rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#0F172A] sm:text-4xl lg:text-[3rem]">
            You see the problem every day.
            <span className="block font-light text-[#64748B]">
              What you don't see is{" "}
              <span className="relative inline-block font-extrabold text-[#0B1F3A]">
                what happens next.
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 4 Q 50 0 100 4 T 200 4"
                    stroke="#0F9D8A"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className={`transition-all duration-[1200ms] ease-out ${
                      visible ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      strokeDasharray: 200,
                      strokeDashoffset: visible ? 0 : 200,
                    }}
                  />
                </svg>
              </span>
            </span>
          </h2>
        </div>

        {/* ================= SPLIT VISUAL ================= */}
        <div className="grid items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* LEFT: Editorial image composition */}
          <div
            className={`relative transition-all duration-1000 ${
              visible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
            }`}
          >
            {/* Main visual container */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#12345B] p-8 sm:p-10">
              {/* Grid pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#0F9D8A]/20 blur-[80px]" />

              <div className="relative">
                {/* Small label */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#DC2626]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
                    The visibility gap
                  </span>
                </div>

                {/* Before / After narrative */}
                <div className="space-y-5">
                  {/* BEFORE */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DC2626]/15 ring-1 ring-[#DC2626]/25">
                      <EyeOff size={18} className="text-[#F87171]" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[13px] font-bold uppercase tracking-wider text-white/40">
                        Today
                      </p>
                      <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-white/85">
                        A citizen reports. Silence follows. No one knows who is
                        working on it, or when.
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="ml-5 h-6 w-px bg-gradient-to-b from-white/25 to-transparent" />

                  {/* AFTER */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F9D8A]/20 ring-1 ring-[#0F9D8A]/40">
                      <Eye size={18} className="text-[#5ED6C5]" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[13px] font-bold uppercase tracking-wider text-[#5ED6C5]">
                        What SAMADHAN changes
                      </p>
                      <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-white">
                        Every report has an owner, a status, and a clear path
                        forward — visible to everyone involved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom flow mini-timeline */}
                <div className="mt-10 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between gap-2">
                    {["Report", "Review", "Assign", "Resolve"].map(
                      (step, i) => (
                        <div key={i} className="flex flex-1 items-center gap-2">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`flex h-2.5 w-2.5 rounded-full transition-all duration-700 ${
                                i <= 1
                                  ? "bg-[#0F9D8A] ring-4 ring-[#0F9D8A]/20"
                                  : "bg-white/20"
                              }`}
                              style={{ transitionDelay: `${500 + i * 150}ms` }}
                            />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                                i <= 1 ? "text-white/85" : "text-white/35"
                              }`}
                              style={{ transitionDelay: `${500 + i * 150}ms` }}
                            >
                              {step}
                            </span>
                          </div>
                          {i < 3 && (
                            <div className="mb-5 h-px flex-1 bg-white/10" />
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat-ish callout (no fake numbers, just label) */}
            <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0F9D8A]">
                One platform
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-[#0B1F3A]">
                Citizens ↔ Authorities ↔ Workers
              </p>
            </div>
          </div>

          {/* RIGHT: What citizens face — horizontal list, not cards */}
          <div
            className={`flex flex-col justify-center transition-all duration-1000 delay-200 ${
              visible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
            }`}
          >
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
              Everyday civic issues
            </p>

            <div className="space-y-0 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
              {reportCategories.slice(0, 6).map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="group flex cursor-default items-center gap-4 py-3.5 transition-all duration-300 hover:bg-[#F5F7FA] hover:pl-2"
                  >
                    <span className="w-6 font-mono text-[11px] font-bold tabular-nums text-[#CBD5E1] transition-colors group-hover:text-[#0F9D8A]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FA] transition-all duration-300 group-hover:bg-[#0B1F3A]">
                      <Icon className="h-4 w-4 text-[#0B1F3A] transition-colors duration-300 group-hover:text-white" />
                    </div>

                    <span className="flex-1 text-[14px] font-semibold text-[#0F172A]">
                      {cat.title}
                    </span>

                    <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-[#CBD5E1] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#0F9D8A] group-hover:opacity-100" />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-2 text-[12px] text-[#64748B]">
              <span className="h-1 w-1 rounded-full bg-[#0F9D8A]" />
              And more — every civic issue belongs here.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
