import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import heroImg from "../../../assets/home-hero.png";

const HomeHero = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  return (
    <section className="relative isolate overflow-hidden bg-[#F5F7FA]">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#0F9D8A]/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-52 right-[-100px] h-[560px] w-[560px] rounded-full bg-[#3B82F6]/[0.06] blur-[130px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(#0B1F3A 1px, transparent 1px), linear-gradient(90deg, #0B1F3A 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 pb-12 pt-6 sm:gap-12 sm:pb-16 sm:pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:pb-20 lg:pt-10">
          {/* LEFT CONTENT */}
          <div
            className={`relative z-10 max-w-2xl transition-all duration-700 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#E2E8F0] bg-white/80 px-4 py-2 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur-sm">
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF7F5]">
                <ShieldCheck size={13} className="text-[#0F9D8A]" />
                <span className="absolute inset-0 animate-ping rounded-full bg-[#0F9D8A]/20" />
              </span>

              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
                Civic Issue Resolution Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#0F172A] sm:text-5xl lg:text-[4.25rem]">
              Report.{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-[#0F9D8A] to-[#0B7C6D] bg-clip-text text-transparent">
                  Track.
                </span>
                <span className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-[#0F9D8A]/15" />
              </span>{" "}
              <span className="text-[#0B1F3A]">Resolve.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-[#64748B] sm:text-[17px] sm:leading-8">
              SAMADHAN connects citizens, authorities and field workers through
              a structured civic issue resolution workflow.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={getPrimaryRoute()}
                state={!user ? { from: "/citizen/report-issue" } : undefined}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(11,31,58,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#12345B] hover:shadow-[0_16px_36px_rgba(11,31,58,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                Report an Issue
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/how-it-works"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1F3A] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0F9D8A]/40 hover:bg-[#F8FAFC] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                See How It Works
                <ArrowRight
                  size={15}
                  className="text-[#64748B] transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* Trust Points */}
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                "Structured workflow",
                "Transparent tracking",
                "Community focused",
              ].map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[13px] font-medium text-[#64748B]"
                >
                  <CheckCircle2 size={15} className="text-[#16A34A]" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div
            className={`relative flex min-h-[320px] items-center justify-center transition-all duration-1000 ease-out sm:min-h-[420px] lg:min-h-[560px] ${
              mounted
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-[0.98] opacity-0"
            }`}
          >
            {/* Soft glow behind image */}
            <div className="absolute right-0 top-1/2 h-[70%] w-[85%] -translate-y-1/2 rounded-full bg-[#0F9D8A]/[0.08] blur-[100px]" />

            {/* Decorative ring */}
            <div className="absolute right-6 top-1/2 hidden h-[440px] w-[440px] -translate-y-1/2 rounded-full border border-dashed border-[#0F9D8A]/15 lg:block" />

            {/* Image */}
            <div className="relative w-full">
              <img
                src={heroImg}
                alt="SAMADHAN civic issue resolution community"
                className="relative z-10 ml-auto h-auto w-full max-w-[680px] object-contain drop-shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
              />
            </div>

            {/* Connector line between floating cards */}
            <svg
              className="absolute inset-0 z-[15] hidden h-full w-full lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d="M 12 78 Q 30 60 78 22"
                stroke="#0F9D8A"
                strokeWidth="0.25"
                strokeDasharray="1.5 1.5"
                fill="none"
                opacity="0.5"
              />
            </svg>

            {/* Floating Status Card (bottom-left) */}
            <div className="absolute bottom-2 left-0 z-20 hidden animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-[#E2E8F0] bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur-md sm:block lg:bottom-10 lg:left-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#EAF7F5] to-[#D5F0EB]">
                  <CheckCircle2 size={20} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-[13px] font-bold text-[#0F172A]">
                    From Report to Resolution
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">
                    One structured civic workflow
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#0F9D8A] to-[#3B82F6]" />
              </div>
            </div>

            {/* Floating Community Card (top-right) */}
            <div className="absolute right-0 top-2 z-20 hidden animate-[float_7s_ease-in-out_infinite_0.5s] rounded-2xl border border-[#E2E8F0] bg-white/95 p-3.5 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-md sm:block lg:top-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]">
                  <Users size={18} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
                    Connected
                  </p>
                  <p className="text-[13px] font-bold text-[#0B1F3A]">
                    Citizens & Authorities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#E2E8F0] to-transparent" />

      {/* Float keyframes (scoped via arbitrary animate) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
};

export default HomeHero;
