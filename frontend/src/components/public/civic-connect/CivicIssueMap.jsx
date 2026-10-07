import React, { useState } from 'react';
import { MapPin, Filter, Layers } from 'lucide-react';

const CivicIssueMap = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Road', 'Garbage', 'Water', 'Street Light', 'Drainage', 'Safety'];

  return (
    <section className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <MapPin className="h-6 w-6" />
              </div>
              Public Issue Map
            </h2>
            <p className="text-slate-600 mt-3 text-lg max-w-2xl">Explore verified civic activity in your area.</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></span>
              <span className="text-slate-700">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]"></span>
              <span className="text-slate-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_0_2px_rgba(20,184,166,0.2)]"></span>
              <span className="text-slate-700">Resolved</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center gap-2 text-slate-500 mr-4 shrink-0">
            <Filter className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
          </div>
          <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={"shrink-0 px-5 py-2 rounded-lg text-sm font-bold transition-all " + (
                  activeFilter === filter
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full h-[500px] lg:h-[600px] bg-slate-200 rounded-3xl border border-slate-300 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <Layers className="h-16 w-16 text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Interactive Map Area</h3>
          <p className="text-slate-500 max-w-md text-center">
            Mapbox integration pending. Public-safe civic information markers will appear here in future updates.
          </p>
          
          {/* Simulated aesthetic map elements for the placeholder */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_0_6px_rgba(59,130,246,0.2)] animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_0_6px_rgba(245,158,11,0.2)]"></div>
          <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-teal-500 rounded-full shadow-[0_0_0_6px_rgba(20,184,166,0.2)]"></div>
        </div>
      </div>
    </section>
  );
};

export default CivicIssueMap;