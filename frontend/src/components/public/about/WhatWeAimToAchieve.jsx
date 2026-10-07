import React from 'react';
import { Check } from 'lucide-react';

const WhatWeAimToAchieve = () => {
  const goals = [
    "Better visibility into civic issues",
    "Clearer coordination between teams",
    "Structured field operations",
    "Evidence-based verification",
    "Transparent issue progress",
    "Greater citizen participation"
  ];

  const imageUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="relative bg-[#0B1F3A] py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="mb-4 inline-block rounded-full bg-[#0F9D8A]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0F9D8A]">
              The Future
            </span>
            <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              What We Aim to Achieve
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-white/70">
              Our platform is designed to systematically improve how civic environments are managed. We are building toward a future characterized by structure, speed, and trust.
            </p>
            
            <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0F9D8A]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-base font-medium text-white/90">
                    {goal}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
              <img 
                src={imageUrl} 
                alt="Modern city infrastructure" 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] to-transparent opacity-80" />
            </div>
            
            {/* Overlay stat card */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-[#0B1F3A]">100%</div>
                <div className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">
                  Verified<br />Resolutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default WhatWeAimToAchieve;
