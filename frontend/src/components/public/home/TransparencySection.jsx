import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle } from "lucide-react";

const TransparencySection = () => {
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(3); // middle stage
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

  const lifecycle = [
    {
      stage: "Reported",
      desc: "Citizen submits a civic issue with photo, location, and description.",
    },
    {
      stage: "Under Review",
      desc: "Admin verifies the report to prevent duplicates and spam.",
    },
    {
      stage: "Approved",
      desc: "Issue is validated and moves forward in the workflow.",
    },
    {
      stage: "Assigned",
      desc: "Manager allocates a field worker based on skills and location.",
    },
    {
      stage: "Work Started",
      desc: "Worker accepts, verifies before-work, and begins execution.",
    },
    {
      stage: "Verified",
      desc: "After-work evidence is reviewed and approved.",
    },
    {
      stage: "Resolved",
      desc: "Issue is closed. Citizen can submit review and feedback.",
    },
  ];

  const total = lifecycle.length;
  const progressPercent = ((activeIdx + 1) / total) * 100;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      {/* Tinted top band */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F5F7FA] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div
          className={`mb-12 max-w-3xl transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F9D8A]/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
              Total Transparency
            </span>
            <span className="h-px w-10 bg-gradient-to-r from-[#0F9D8A] to-transparent" />
          </div>

          <h2 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-[#0F172A] sm:text-4xl lg:text-[2.85rem]">
            Every stage.{" "}
            <span className="block font-light text-[#64748B]">
              Visible to everyone.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#64748B] sm:text-sm">
            Unlike traditional systems where complaints disappear into a black
            box, SAMADHAN exposes the entire issue lifecycle.
          </p>
        </div>

        {/* ================= HORIZONTAL TIMELINE RAIL ================= */}
        <div
          className={`relative transition-all duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Rail container */}
          <div className="relative px-2 sm:px-4">
            {/* Base rail */}
            <div className="absolute left-0 right-0 top-[22px] h-[2px] bg-[#E2E8F0]" />

            {/* Progress rail */}
            <div
              className="absolute left-0 top-[22px] h-[2px] bg-gradient-to-r from-[#0F9D8A] to-[#3B82F6] transition-all duration-1000 ease-out"
              style={{
                width: visible ? `${progressPercent}%` : "0%",
                transitionDelay: "300ms",
              }}
            />

            {/* Nodes */}
            <div className="relative flex justify-between">
              {lifecycle.map((item, i) => {
                const isActive = i === activeIdx;
                const isCompleted = i <= activeIdx;

                return (
                  <button
                    key={item.stage}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className="group relative flex flex-1 flex-col items-center focus:outline-none"
                  >
                    {/* Node circle */}
                    <div
                      className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isActive
                          ? "border-[#0F9D8A] bg-white shadow-[0_8px_24px_rgba(15,157,138,0.25)] scale-110"
                          : isCompleted
                            ? "border-[#0F9D8A] bg-[#0F9D8A]"
                            : "border-[#E2E8F0] bg-white group-hover:border-[#0F9D8A]/50"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : isActive ? (
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F9D8A]/60" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0F9D8A]" />
                        </span>
                      ) : (
                        <Circle
                          className={`h-4 w-4 transition-colors ${
                            isCompleted ? "text-white" : "text-[#CBD5E1]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`mt-4 max-w-[80px] text-center text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 sm:max-w-none sm:text-[11px] ${
                        isActive
                          ? "text-[#0F9D8A]"
                          : isCompleted
                            ? "text-[#0B1F3A]"
                            : "text-[#94A3B8] group-hover:text-[#64748B]"
                      }`}
                    >
                      {item.stage}
                    </span>

                    {/* Number */}
                    <span
                      className={`mt-1 font-mono text-[9px] font-bold tabular-nums transition-colors ${
                        isCompleted ? "text-[#0F9D8A]" : "text-[#CBD5E1]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= ACTIVE STAGE PREVIEW ================= */}
          <div
            className="relative mt-10 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F5F7FA] transition-all duration-700"
            style={{ transitionDelay: "400ms" }}
          >
            {/* Left accent */}
            <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#0F9D8A] to-[#3B82F6]" />

            <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-7">
              {/* Stage number */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0B1F3A] shadow-[0_10px_25px_rgba(11,31,58,0.20)]">
                <span className="font-mono text-[18px] font-bold text-[#5ED6C5]">
                  {String(activeIdx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div
                key={activeIdx}
                className="min-w-0 flex-1"
                style={{ animation: "fadeSlideIn 400ms ease-out" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0F9D8A]">
                    Stage {activeIdx + 1} of {total}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#0F9D8A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">
                    {activeIdx === total - 1 ? "Complete" : "In progress"}
                  </span>
                </div>

                <h3 className="mt-1.5 text-[17px] font-extrabold leading-tight tracking-tight text-[#0B1F3A] sm:text-[19px]">
                  {lifecycle[activeIdx].stage}
                </h3>

                <p className="mt-2 max-w-lg text-[13px] leading-6 text-[#64748B]">
                  {lifecycle[activeIdx].desc}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="hidden shrink-0 sm:block">
                <div className="text-right">
                  <div className="font-mono text-[28px] font-bold leading-none tracking-tight text-[#0B1F3A]">
                    {Math.round(progressPercent)}
                    <span className="text-[14px] text-[#94A3B8]">%</span>
                  </div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Lifecycle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM NOTE ================= */}
        <div
          className={`mt-8 flex items-center justify-center gap-3 transition-all duration-700 delay-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="h-px w-10 bg-[#E2E8F0]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
            Every stage is logged. Every decision is visible.
          </span>
          <span className="h-px w-10 bg-[#E2E8F0]" />
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

export default TransparencySection;
