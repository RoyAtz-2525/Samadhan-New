import React, { useState } from 'react';
import { MapPin, Filter, Layers } from 'lucide-react';

const CivicIssueMap = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Road', 'Garbage', 'Water', 'Street Light', 'Drainage', 'Safety'];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-blue-600 h-6 w-6" />
              Public Issue Map
            </h2>
            <p className="text-gray-600 mt-1">Explore civic activity in your area.</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-700">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-700">Resolved</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Map Container (Placeholder for future Mapbox integration) */}
        <div className="w-full h-[500px] bg-gray-200 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden">
          <Layers className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Interactive Map Area</h3>
          <p className="text-gray-500 max-w-md text-center">
            Mapbox integration pending. Public-safe civic information markers will appear here in future updates.
          </p>
          
          {/* Simulated aesthetic map elements for the placeholder */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_0_4px_rgba(245,158,11,0.2)]"></div>
          <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
        </div>
      </div>
    </section>
  );
};

export default CivicIssueMap;
