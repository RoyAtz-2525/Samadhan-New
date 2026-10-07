import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const PlatformFeatures = () => {
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
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const items = [
    {
      title: "Location-based reporting",
      img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
      size: "col-span-2 row-span-2", // HERO
    },
    {
      title: "Photo/video evidence",
      img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
      size: "col-span-1 row-span-1",
    },
    {
      title: "Worker allocation",
      img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80",
      size: "col-span-1 row-span-1",
    },
    {
      title: "Before/after verification",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      size: "col-span-2 row-span-1",
    },
    {
      title: "Progress tracking",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      size: "col-span-2 row-span-1",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER — COMPACT ================= */}
        <div
          className={`mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
                Platform Features
              </span>
            </div>
            <h2 className="text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-[#0F172A] sm:text-[1.85rem] lg:text-[2.15rem]">
              Built for the{" "}
              <span className="relative inline-block">
                <span className="relative z-10">civic journey</span>
                <span className="absolute bottom-0.5 left-0 h-[5px] w-full rounded-sm bg-[#0F9D8A]/25" />
              </span>
            </h2>
          </div>

          <p className="max-w-xs text-[12px] leading-5 text-[#64748B] sm:text-right">
            From the first camera click to verified resolution.
          </p>
        </div>

        {/* ================= COMPACT MOSAIC ================= */}
        <div className="grid auto-rows-[110px] grid-cols-2 gap-2.5 sm:auto-rows-[130px] sm:gap-3 lg:auto-rows-[140px] lg:grid-cols-4 lg:gap-3">
          {items.map((item, i) => (
            <button
              key={item.title}
              type="button"
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`group relative overflow-hidden rounded-xl text-left transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F9D8A] ${item.size} ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <img
                src={item.img}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-[#0B1F3A]/20 to-transparent transition-opacity duration-500 group-hover:from-[#0B1F3A]/95" />

              {/* Corner accent */}
              <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#5ED6C5] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Label */}
              <div className="relative flex h-full flex-col justify-end p-3.5 sm:p-4">
                <h3 className="text-[12px] font-bold leading-tight text-white sm:text-[13px]">
                  {item.title}
                </h3>
                <span className="mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#5ED6C5] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  Explore
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* ================= BOTTOM BAR — SLIM ================= */}
        <div
          className={`mt-6 flex flex-col items-start justify-between gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:items-center transition-all duration-700 delay-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0F9D8A]/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">
              10 features · One platform
            </span>
          </div>

          <button
            type="button"
            className="group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0F9D8A] transition-colors hover:text-[#0B1F3A]"
          >
            Explore all features
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
