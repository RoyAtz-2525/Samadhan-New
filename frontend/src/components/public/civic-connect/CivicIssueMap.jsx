import React, { useState, useEffect } from 'react';
import MapboxMap from '../../maps/MapboxMap';
import { MapPin, Filter, Layers } from 'lucide-react';

const CivicIssueMap = () => {
  const [publicIssues, setPublicIssues] = useState([]);
  
  useEffect(() => {
    // In a real implementation, this would fetch from /api/issues/public-map
    // Fetching minimal safe data: id, title, latitude, longitude, status, category
    // For now, we leave it empty or mock a few for demonstration if needed.
    const fetchPublicIssues = async () => {
      try {
        // const response = await fetch('/api/issues/public-map');
        // const data = await response.json();
        // setPublicIssues(data);
        
        // Mock data
        setPublicIssues([
          { id: '1', title: 'Pothole on Main Road', category: 'Road', status: 'OPEN', latitude: 28.6139, longitude: 77.2090 },
          { id: '2', title: 'Streetlight not working', category: 'Street Light', status: 'IN_PROGRESS', latitude: 28.6239, longitude: 77.2190 },
          { id: '3', title: 'Water leakage', category: 'Water', status: 'RESOLVED', latitude: 28.6039, longitude: 77.1990 },
        ]);
      } catch (err) {
        console.error("Failed to fetch public map data", err);
      }
    };
    
    fetchPublicIssues();
  }, []);

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
          <MapboxMap 
            height="100%"
            zoom={12}
            center={[78.9629, 20.5937]}
            markers={publicIssues.filter(i => (activeFilter === 'All' || i.category === activeFilter)).map(i => ({
              id: i.id,
              longitude: i.longitude,
              latitude: i.latitude,
              color: i.status === 'RESOLVED' ? '#14b8a6' : i.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6',
              popupHTML: `
                <div class="text-sm font-sans p-1">
                  <p class="font-bold mb-1">${i.title}</p>
                  <p class="text-xs text-gray-500 mb-2">${i.category}</p>
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white" 
                    style="background-color: ${i.status === 'RESOLVED' ? '#14b8a6' : i.status === 'IN_PROGRESS' ? '#f59e0b' : '#3b82f6'}">
                    ${i.status}
                  </span>
                </div>
              `
            }))}
            className="absolute inset-0"
          />
        </div>
      </div>
    </section>
  );
};

export default CivicIssueMap;
