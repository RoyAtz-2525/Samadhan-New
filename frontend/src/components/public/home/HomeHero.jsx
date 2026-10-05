import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import heroImg from "../../../assets/home-hero.png";

const HomeHero = () => {
  const { user } = useAuth();

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
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0F9D8A]/5 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[#3B82F6]/5 blur-3xl" />

      {/* Subtle Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#0B1F3A 1px, transparent 1px), linear-gradient(90deg, #0B1F3A 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 py-9 sm:gap-8 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-2 lg:py-12">
          {/* LEFT CONTENT */}
          <div className="relative z-10 max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-2 shadow-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF7F5]">
                <ShieldCheck size={14} className="text-[#0F9D8A]" />
              </span>

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                Civic Issue Resolution Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0F172A] sm:text-5xl lg:text-[4rem]">
              Report. <span className="text-[#0F9D8A]">Track.</span>{" "}
              <span className="text-[#0B1F3A]">Resolve.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-7 text-[#64748B] sm:text-lg sm:leading-8">
              SAMADHAN connects citizens, authorities and field workers through
              a structured civic issue resolution workflow.
            </p>

            {/* CTA */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={getPrimaryRoute()}
                state={!user ? { from: "/citizen/report-issue" } : undefined}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,31,58,0.18)] transition-all duration-200 hover:bg-[#12345B] hover:shadow-[0_12px_30px_rgba(11,31,58,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                Report an Issue
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1F3A] shadow-sm transition-all duration-200 hover:border-[#94A3B8] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust Points */}
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                <CheckCircle2 size={15} className="text-[#16A34A]" />
                Structured workflow
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                <CheckCircle2 size={15} className="text-[#16A34A]" />
                Transparent tracking
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                <CheckCircle2 size={15} className="text-[#16A34A]" />
                Community focused
              </div>
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="relative flex min-h-[310px] items-center justify-center sm:min-h-[380px] lg:min-h-[500px]">
            {/* Soft Glow */}
            <div className="absolute right-0 top-1/2 h-[75%] w-[85%] -translate-y-1/2 rounded-full bg-[#0F9D8A]/5 blur-3xl" />

            {/* Image */}
            <div className="relative w-full">
              <img
                src={heroImg}
                alt="SAMADHAN civic issue resolution community"
                className="relative z-10 ml-auto h-auto w-full max-w-[680px] object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.10)]"
              />
            </div>

            {/* Floating Status Card */}
            <div className="absolute bottom-3 left-2 z-20 hidden rounded-2xl border border-[#E2E8F0] bg-white/95 p-3.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:block lg:bottom-8 lg:left-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F5]">
                  <CheckCircle2 size={19} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0F172A]">
                    From Report to Resolution
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#64748B]">
                    One structured civic workflow
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Community Card */}
            <div className="absolute right-0 top-3 z-20 hidden rounded-2xl border border-[#E2E8F0] bg-white/95 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:block lg:top-8">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
                  <Users size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Connected
                  </p>

                  <p className="text-xs font-bold text-[#0B1F3A]">
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
    </section>
  );
};

export default HomeHero;
