import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  HardHat,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const HomeCTA = () => {
  const { user } = useAuth();
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

  const getPrimaryRoute = () => {
    if (!user) return "/register";
    switch (user.role?.name) {
      case "CITIZEN":
        return "/citizen/report-issue";
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/manager";
      case "WORKER":
        return "/worker";
      case "SUPER_ADMIN":
        return "/super-admin";
      default:
        return "/";
    }
  };

  const activity = [
    {
      icon: MapPin,
      title: "Issue reported",
      meta: "Ward 04 · Sector B",
      color: "#3B82F6",
      time: "Just now",
    },
    {
      icon: HardHat,
      title: "Worker assigned",
      meta: "Field team notified",
      color: "#F59E0B",
      time: "2 min ago",
    },
    {
      icon: CheckCircle2,
      title: "Issue resolved",
      meta: "Verified by manager",
      color: "#16A34A",
      time: "5 min ago",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#EAF7F5] via-[#F0F9F7] to-[#EFF6FF] py-16 sm:py-20 lg:py-24"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#0F9D8A]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#3B82F6]/10 blur-[130px]" />

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(11,31,58,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= BIG CARD CONTAINER ================= */}
        <div
          className={`relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_30px_80px_rgba(11,31,58,0.10)] backdrop-blur-xl transition-all duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Inner decorations */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#0F9D8A]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#3B82F6]/10 blur-3xl" />

          {/* Grid pattern inside card */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#0B1F3A 1px, transparent 1px), linear-gradient(90deg, #0B1F3A 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent 100%)",
            }}
          />

          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:p-14">
            {/* ================= LEFT: CONTENT ================= */}
            <div
              className={`transition-all duration-1000 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              {/* Eyebrow chip */}
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                <Sparkles className="h-3.5 w-3.5 text-[#0F9D8A]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                  Ready when you are
                </span>
              </div>

              <h2 className="text-[1.85rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-4xl lg:text-[3rem]">
                See a civic problem?
                <span className="block font-light text-[#64748B]">
                  Start the process.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-[14px] leading-7 text-[#64748B] sm:text-[15px]">
                Join your community in making the city better — one resolved
                issue at a time. Every report has a path, every stage has an
                owner.
              </p>

              {/* CTAs */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={getPrimaryRoute()}
                  state={!user ? { from: "/citizen/report-issue" } : undefined}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_10px_30px_rgba(11,31,58,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#12345B] hover:shadow-[0_16px_40px_rgba(11,31,58,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                >
                  Report an Issue
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/civic-connect"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-6 py-3.5 text-[14px] font-bold text-[#0B1F3A] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0F9D8A]/40 hover:bg-[#F8FAFC] hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                >
                  Explore Civic Connect
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                {[
                  "Structured workflow",
                  "Transparent tracking",
                  "Community focused",
                ].map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] font-medium text-[#64748B]"
                  >
                    <CheckCircle2 size={13} className="text-[#16A34A]" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* ================= RIGHT: LIVE ACTIVITY FEED ================= */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <div className="relative space-y-3">
                {/* Label */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A]/60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#16A34A]">
                      Live activity
                    </span>
                  </div>

                  <span className="hidden font-mono text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] sm:inline">
                    Updates stream
                  </span>
                </div>

                {/* Activity cards */}
                {activity.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        animation: visible
                          ? `float 5s ease-in-out ${i * 0.4}s infinite, fadeSlideIn 600ms ease-out ${
                              i * 150 + 400
                            }ms both`
                          : "none",
                      }}
                      className="group relative rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
                    >
                      <span
                        className="absolute left-0 top-1/2 h-[55%] w-[3px] -translate-y-1/2 rounded-r-full"
                        style={{ backgroundColor: item.color }}
                      />

                      <div className="flex items-start gap-3 pl-2">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: item.color }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-[12px] font-bold leading-tight text-[#0B1F3A]">
                              {item.title}
                            </h3>

                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#CBD5E1]">
                              {item.time}
                            </span>
                          </div>

                          <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                            {item.meta}
                          </p>

                          {/* Step bar */}
                          <div className="mt-2.5 flex items-center gap-1">
                            {[...Array(5)].map((_, j) => (
                              <span
                                key={j}
                                className="h-[3px] flex-1 rounded-full transition-colors duration-500"
                                style={{
                                  backgroundColor:
                                    j <= i + 1 ? `${item.color}60` : "#F1F5F9",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Watching status */}
                <div className="pt-1">
                  <div className="flex items-center justify-between rounded-xl border border-dashed border-[#E2E8F0] bg-white/60 px-4 py-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-[#94A3B8]" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        Watching for reports
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <span
                        className="h-1 w-1 animate-pulse rounded-full bg-[#0F9D8A]"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1 w-1 animate-pulse rounded-full bg-[#0F9D8A]"
                        style={{ animationDelay: "200ms" }}
                      />
                      <span
                        className="h-1 w-1 animate-pulse rounded-full bg-[#0F9D8A]"
                        style={{ animationDelay: "400ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip inside card */}
          <div className="relative border-t border-[#E2E8F0]/70 px-8 py-5 sm:px-10 lg:px-14">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                SAMADHAN · Civic Issue Resolution Platform
              </span>

              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F9D8A]/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Report → Resolve
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default HomeCTA;
