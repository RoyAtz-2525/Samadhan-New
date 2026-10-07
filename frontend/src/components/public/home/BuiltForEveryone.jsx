import React, { useState, useEffect, useRef } from "react";
import { Users, Shield, Settings, HardHat, ArrowUpRight } from "lucide-react";

const BuiltForEveryone = () => {
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
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const roles = [
    {
      name: "Citizens",
      icon: Users,
      desc: "Report and track civic issues directly from your mobile device.",
      img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      accent: "#3B82F6",
    },
    {
      name: "Administrators",
      icon: Shield,
      desc: "Review and verify reported issues to prevent duplicates and spam.",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      accent: "#F59E0B",
    },
    {
      name: "Managers",
      icon: Settings,
      desc: "Coordinate assignments, oversee workers, and verify resolutions.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
      accent: "#8B5CF6",
    },
    {
      name: "Field Workers",
      icon: HardHat,
      desc: "Execute and document civic work with transparent proof of progress.",
      img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
      accent: "#16A34A",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0B1F3A] py-14 sm:py-16 lg:py-20"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#0F9D8A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#3B82F6]/10 blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div
          className={`mb-10 max-w-3xl transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5ED6C5]/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#5ED6C5]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5ED6C5]">
              Built for Everyone
            </span>
            <span className="h-px w-10 bg-gradient-to-r from-[#5ED6C5] to-transparent" />
          </div>

          <h2 className="text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-white sm:text-4xl lg:text-[2.85rem]">
            One ecosystem.{" "}
            <span className="block font-light text-white/50">
              Four roles. One mission.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-[13px] leading-6 text-white/50 sm:text-sm">
            A cohesive platform supporting all roles in the civic infrastructure
            lifecycle.
          </p>
        </div>

        {/* ================= ROLE PANELS ================= */}
        <div
          className={`flex flex-col gap-3 lg:flex-row lg:h-[440px] lg:gap-3 transition-all duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isActive = activeIdx === i;

            return (
              <div
                key={role.name}
                onMouseEnter={() => setActiveIdx(i)}
                onFocus={() => setActiveIdx(i)}
                className={`group relative flex cursor-pointer overflow-hidden rounded-2xl border transition-all duration-700 ease-out lg:rounded-2xl ${
                  isActive
                    ? "border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.35)] lg:flex-[2.2]"
                    : "border-white/10 lg:flex-[0.85]"
                } ${isActive ? "h-[260px] lg:h-auto" : "h-[160px] lg:h-auto"}`}
                style={{
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                {/* Image background */}
                <img
                  src={role.img}
                  alt={role.name}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                    isActive
                      ? "scale-105 grayscale-0"
                      : "grayscale group-hover:grayscale-0"
                  }`}
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-700 ${
                    isActive
                      ? "bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/55 to-[#0B1F3A]/25"
                      : "bg-gradient-to-t from-[#0B1F3A]/95 via-[#0B1F3A]/70 to-[#0B1F3A]/40"
                  }`}
                />

                {/* Accent color strip — top */}
                <span
                  className="absolute left-0 top-0 h-[3px] transition-all duration-700"
                  style={{
                    width: isActive ? "100%" : "0%",
                    backgroundColor: role.accent,
                  }}
                />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                  {/* Top: icon + number */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                        isActive
                          ? "border-white/25 bg-white/15"
                          : "border-white/10 bg-white/[0.06]"
                      }`}
                    >
                      <Icon
                        className="h-5 w-5 transition-colors duration-500"
                        style={{
                          color: isActive ? role.accent : "#94A3B8",
                        }}
                      />
                    </div>

                    <span className="font-mono text-[10px] font-bold tabular-nums text-white/40">
                      0{i + 1}
                    </span>
                  </div>

                  {/* Bottom: name + desc + arrow */}
                  <div>
                    <h3
                      className={`font-extrabold leading-tight tracking-tight transition-all duration-500 ${
                        isActive
                          ? "text-[1.4rem] text-white sm:text-[1.6rem]"
                          : "text-[1.15rem] text-white/85 sm:text-[1.25rem]"
                      }`}
                    >
                      {role.name}
                    </h3>

                    {/* Description — only visible when active on desktop */}
                    <div
                      className={`grid transition-all duration-700 ${
                        isActive
                          ? "mt-2 grid-rows-[1fr] opacity-100"
                          : "mt-0 grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xs text-[12px] leading-5 text-white/60 sm:text-[13px] sm:leading-6">
                          {role.desc}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      className={`mt-3 flex items-center gap-2 transition-all duration-500 ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-2 opacity-0"
                      }`}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.16em]"
                        style={{ color: role.accent }}
                      >
                        Explore role
                      </span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        style={{ color: role.accent }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= BOTTOM STRIP ================= */}
        <div
          className={`mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5 transition-all duration-700 delay-500 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Citizens · Admins · Managers · Workers
            </span>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            {roles.map((role, i) => (
              <span
                key={role.name}
                className={`h-1 rounded-full transition-all duration-500 ${
                  activeIdx === i ? "w-6 bg-white/60" : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForEveryone;
