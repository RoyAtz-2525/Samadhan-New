import React, { useState, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { reportCategories } from "../../../data/public/reportCategories";

// Online civic images
const categoryImages = {
  roads:
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&q=80",
  streetlights:
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80",
  garbage:
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80",
  drainage:
    "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&q=80",
  water:
    "https://images.unsplash.com/photo-1541544537156-7627a7a4aa1c?w=1200&q=80",
  safety:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
};

const getImage = (cat) => {
  const key = cat.id?.toLowerCase() || cat.title?.toLowerCase();
  for (const [k, v] of Object.entries(categoryImages)) {
    if (key?.includes(k)) return v;
  }
  return categoryImages.roads;
};

const ReportCategories = () => {
  const [activeId, setActiveId] = useState(reportCategories[0]?.id);
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

  const categories = reportCategories.slice(0, 6);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-12 sm:py-14 lg:py-16"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <div
          className={`mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F9D8A]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F9D8A]">
                Categories
              </span>
              <span className="h-px w-10 bg-gradient-to-r from-[#0F9D8A] to-transparent" />
            </div>

            <h2 className="text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] text-[#0F172A] sm:text-[1.85rem] lg:text-[2.15rem]">
              What can you{" "}
              <span className="relative inline-block">
                <span className="relative z-10">report</span>
                <span className="absolute bottom-0.5 left-0 h-[5px] w-full rounded-sm bg-[#0F9D8A]/25" />
              </span>
              ?
            </h2>
          </div>

          <p className="max-w-xs text-[12px] leading-5 text-[#64748B] sm:text-right">
            Hover any row to preview the category.
          </p>
        </div>

        {/* ================= HOVER-EXPAND ROWS ================= */}
        <div
          className={`border-t border-[#E2E8F0] transition-all duration-700 delay-100 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            const isActive = activeId === cat.id;
            const imgUrl = getImage(cat);

            return (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setActiveId(cat.id)}
                onFocus={() => setActiveId(cat.id)}
                onClick={() => setActiveId(cat.id)}
                className={`group relative flex w-full items-center gap-4 overflow-hidden border-b border-[#E2E8F0] text-left transition-all duration-500 focus:outline-none ${
                  isActive ? "h-[110px] sm:h-[130px]" : "h-[62px]"
                }`}
              >
                {/* Background image — fades in when active */}
                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: isActive ? 1 : 0 }}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/80 to-[#0B1F3A]/60" />
                </div>

                {/* Left accent bar */}
                <span
                  className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#0F9D8A] to-[#5ED6C5] transition-all duration-500 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Content */}
                <div className="relative flex w-full items-center gap-4 px-4 sm:px-6">
                  {/* Number */}
                  <span
                    className={`shrink-0 font-mono text-[11px] font-bold tabular-nums transition-colors duration-300 sm:text-[12px] ${
                      isActive
                        ? "text-[#5ED6C5]"
                        : "text-[#CBD5E1] group-hover:text-[#0F9D8A]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/15 ring-1 ring-white/20 backdrop-blur-sm"
                        : "bg-[#F5F7FA] group-hover:bg-[#EAF7F5]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors duration-300 ${
                        isActive
                          ? "text-[#5ED6C5]"
                          : "text-[#0B1F3A] group-hover:text-[#0F9D8A]"
                      }`}
                    />
                  </div>

                  {/* Title + description */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-[14px] font-bold leading-tight transition-colors duration-300 sm:text-[15px] ${
                        isActive ? "text-white" : "text-[#0F172A]"
                      }`}
                    >
                      {cat.title}
                    </h3>

                    {isActive && cat.description && (
                      <p
                        className="mt-1 line-clamp-1 max-w-lg text-[11px] leading-5 text-white/60 sm:text-[12px]"
                        style={{ animation: "fadeSlideIn 400ms ease-out" }}
                      >
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Active indicator */}
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`hidden text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-300 sm:inline ${
                        isActive ? "text-[#5ED6C5]" : "text-transparent"
                      }`}
                    >
                      Preview
                    </span>

                    <ArrowUpRight
                      className={`h-4 w-4 transition-all duration-300 ${
                        isActive
                          ? "translate-x-0 text-[#5ED6C5] opacity-100"
                          : "-translate-x-1 text-[#CBD5E1] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================= BOTTOM NOTE ================= */}
        <div
          className={`mt-6 flex items-center justify-center gap-3 transition-all duration-700 delay-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="h-px w-10 bg-[#E2E8F0]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
            Every civic issue belongs here
          </span>
          <span className="h-px w-10 bg-[#E2E8F0]" />
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default ReportCategories;
