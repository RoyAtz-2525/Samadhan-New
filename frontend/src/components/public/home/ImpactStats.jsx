import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  CheckCircle2,
  Clock,
  HardHat,
  Users,
  Camera,
  ArrowUpRight,
} from "lucide-react";

const ImpactStats = () => {
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
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

  const lifecycle = [
    "Reported",
    "Under Review",
    "Assigned",
    "Work Started",
    "Verified",
    "Resolved",
  ];

  // Sample issue cards — UI structure only, no fake numbers
  const issues = [
    {
      id: "01",
      category: "Road Damage",
      location: "Ward 04 · Sector B",
      status: "In Progress",
      color: "#8B5CF6",
      icon: MapPin,
      progress: 62,
      worker: "Field Worker",
      media: true,
    },
    {
      id: "02",
      category: "Street Light",
      location: "Ward 02 · Sector A",
      status: "Resolved",
      color: "#16A34A",
      icon: CheckCircle2,
      progress: 100,
      worker: "Verified",
      media: true,
    },
    {
      id: "03",
      category: "Garbage Collection",
      location: "Ward 07 · Sector C",
      status: "Under Review",
      color: "#F59E0B",
      icon: Clock,
      progress: 25,
      worker: "Admin Review",
      media: false,
    },
    {
      id: "04",
      category: "Drainage Issue",
      location: "Ward 05 · Sector D",
      status: "Assigned",
      color: "#3B82F6",
      icon: HardHat,
      progress: 40,
      worker: "Worker Assigned",
      media: false,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      {/* Tinted top band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F5F7FA] to-transparent" />

      {/* Soft accents */}
      <div className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-[#0F9D8A]/[0.05] blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-32 h-72 w-72 rounded-full bg-[#3B82F6]/[0.05] blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* ================= LEFT: STATEMENT + LIFECYCLE ================= */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className={`transition-all duration-700 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F9D8A]/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
                  Measurable Impact
                </span>
                <span className="h-px w-10 bg-gradient-to-r from-[#0F9D8A] to-transparent" />
              </div>

              {/* Heading */}
              <h2 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#0F172A] sm:text-4xl lg:text-[2.75rem]">
                Built for{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">measurable</span>
                  <span className="absolute bottom-0.5 left-0 h-[6px] w-full rounded-sm bg-[#0F9D8A]/25" />
                </span>{" "}
                civic impact
              </h2>

              <p className="mt-5 max-w-md text-[14px] leading-7 text-[#64748B]">
                Every issue tracked. Every stage visible. Every resolution
                accountable — from the first report to the final verification.
              </p>

              {/* Divider */}
              <div className="my-7 h-px w-full bg-gradient-to-r from-[#E2E8F0] to-transparent" />

              {/* Lifecycle vertical track */}
              <div className="space-y-0">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  The lifecycle
                </p>

                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E2E8F0]" />
                  <div
                    className="absolute left-[7px] top-2 w-px bg-gradient-to-b from-[#0F9D8A] to-[#3B82F6] transition-all duration-1000 ease-out"
                    style={{
                      height: visible ? "75%" : "0%",
                      transitionDelay: "300ms",
                    }}
                  />

                  <div className="space-y-3.5">
                    {lifecycle.map((stage, i) => {
                      const isDone = i <= 3;
                      return (
                        <div
                          key={stage}
                          className="relative flex items-center gap-3"
                          style={{
                            animation: visible
                              ? `fadeSlideIn 400ms ease-out ${
                                  i * 100 + 400
                                }ms both`
                              : "none",
                          }}
                        >
                          <span
                            className={`relative z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 bg-white transition-colors duration-500 ${
                              isDone ? "border-[#0F9D8A]" : "border-[#E2E8F0]"
                            }`}
                          >
                            {isDone && (
                              <span className="h-[5px] w-[5px] rounded-full bg-[#0F9D8A]" />
                            )}
                          </span>

                          <span
                            className={`text-[12px] font-semibold transition-colors duration-500 ${
                              isDone ? "text-[#0B1F3A]" : "text-[#94A3B8]"
                            }`}
                          >
                            {stage}
                          </span>

                          {isDone && (
                            <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-wider text-[#0F9D8A]">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom note */}
              <div className="mt-8 flex items-center gap-2 text-[11px] text-[#94A3B8]">
                <span className="h-1 w-1 rounded-full bg-[#0F9D8A]" />
                Every action logged. Every decision visible.
              </div>
            </div>
          </div>

          {/* ================= RIGHT: LIVING CARD STACK ================= */}
          <div className="space-y-3">
            {/* Header row */}
            <div
              className={`flex items-center justify-between transition-all duration-700 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                Active issues
              </span>

              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A]/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                </span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#16A34A]">
                  Live
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {issues.map((issue, i) => {
                const Icon = issue.icon;
                const isActive = activeIdx === i;

                return (
                  <div
                    key={issue.id}
                    onMouseEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      transitionDelay: `${i * 90}ms`,
                    }}
                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                    } ${
                      isActive
                        ? "border-[#0F9D8A]/40 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                        : "border-[#E2E8F0] bg-[#FAFBFC] hover:bg-white"
                    }`}
                  >
                    {/* Left accent */}
                    <span
                      className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500"
                      style={{
                        backgroundColor: isActive ? issue.color : "transparent",
                      }}
                    />

                    <div className="p-4 sm:p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
                            style={{
                              backgroundColor: isActive
                                ? `${issue.color}15`
                                : "#F5F7FA",
                            }}
                          >
                            <Icon
                              className="h-4 w-4 transition-colors duration-300"
                              style={{
                                color: isActive ? issue.color : "#94A3B8",
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-[13px] font-bold leading-tight text-[#0B1F3A] sm:text-[14px]">
                                {issue.category}
                              </h3>
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#CBD5E1]">
                                #{issue.id}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                              {issue.location}
                            </p>
                          </div>
                        </div>

                        {/* Status pill */}
                        <span
                          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${issue.color}15`,
                            color: issue.color,
                          }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: issue.color }}
                          />
                          {issue.status}
                        </span>
                      </div>

                      {/* Expandable progress section */}
                      <div
                        className={`grid transition-all duration-500 ease-out ${
                          isActive
                            ? "mt-4 grid-rows-[1fr] opacity-100"
                            : "mt-0 grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                Progress
                              </span>
                              <span className="font-mono text-[9px] font-bold tabular-nums text-[#64748B]">
                                {issue.progress}%
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F7FA]">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: isActive ? `${issue.progress}%` : "0%",
                                  backgroundColor: issue.color,
                                }}
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3 w-3 text-[#94A3B8]" />
                                <span className="text-[10px] font-medium text-[#64748B]">
                                  {issue.worker}
                                </span>
                              </div>

                              {issue.media && (
                                <div className="flex items-center gap-1.5">
                                  <Camera className="h-3 w-3 text-[#94A3B8]" />
                                  <span className="font-mono text-[9px] font-bold text-[#94A3B8]">
                                    Media
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B1F3A] text-white transition-transform duration-300 group-hover:scale-110">
                              <ArrowUpRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div
              className={`flex items-center justify-between pt-4 transition-all duration-700 delay-500 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-[#E2E8F0]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                  Live lifecycle tracking
                </span>
              </div>

              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F9D8A]">
                ● Report → Resolve
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default ImpactStats;
