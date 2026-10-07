import React from "react";

const AboutHero = () => {
  const aboutHeroImg =
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=85";

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#0F9D8A]/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#3B82F6]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Content */}
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F5F7FA] px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0F9D8A]" />

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                About SAMADHAN
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
              Building a More <span className="text-[#0F9D8A]">Connected</span>{" "}
              Civic Experience
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#64748B] sm:text-lg">
              SAMADHAN brings citizens, administrators, managers, and field
              workers into one structured platform for reporting, coordinating,
              and resolving civic issues.
            </p>

            {/* Small visual journey */}
            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm font-medium text-[#475569]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1F3A] text-xs text-white">
                  01
                </span>
                Report
              </div>

              <span className="text-[#CBD5E1]">→</span>

              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F9D8A] text-xs text-white">
                  02
                </span>
                Coordinate
              </div>

              <span className="text-[#CBD5E1]">→</span>

              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3B82F6] text-xs text-white">
                  03
                </span>
                Resolve
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-[28px] border border-[#E2E8F0] bg-[#F5F7FA] p-2 shadow-[0_20px_60px_rgba(11,31,58,0.12)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <img
                  src={aboutHeroImg}
                  alt="Community working together"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/70 via-transparent to-transparent" />

                {/* Image caption */}
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/70">
                    One connected platform
                  </p>

                  <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                    Citizens → Authorities → Resolution
                  </p>
                </div>
              </div>
            </div>

            {/* Floating accent */}
            <div className="absolute -bottom-4 -left-4 hidden h-16 w-16 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white shadow-lg sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F9D8A]/10">
                <div className="h-3 w-3 rounded-full bg-[#0F9D8A]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
