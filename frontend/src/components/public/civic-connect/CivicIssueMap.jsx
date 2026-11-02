import React, { useState, useEffect } from "react";
import MapboxMap from "../../maps/MapboxMap";
import { MapPin, Filter } from "lucide-react";
import api from "../../../services/api";

const CivicIssueMap = ({ issues: propIssues }) => {
  const [internalIssues, setInternalIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (propIssues !== undefined) return;

    let isMounted = true;
    api.get("/issues/public-map").then((response) => {
      if (isMounted && Array.isArray(response.data)) {
        setInternalIssues(response.data);
      }
    }).catch((err) => {
      console.error("Failed to fetch public map data", err);
    });

    return () => {
      isMounted = false;
    };
  }, [propIssues]);

  const publicIssues = propIssues !== undefined ? propIssues : internalIssues;

  const knownCategories = [
    "Road Damage",
    "Street Light",
    "Garbage",
    "Drainage",
    "Water Leakage",
    "Traffic/Safety",
  ];

  const availableCategories = [
    "All",
    ...new Set([
      ...publicIssues.map((i) => i.category).filter(Boolean),
      ...knownCategories,
    ]),
  ];

  const filteredIssues =
    activeFilter === "All"
      ? publicIssues
      : publicIssues.filter(
          (issue) =>
            issue.category?.toLowerCase() === activeFilter.toLowerCase(),
        );

  const validCoordinates = publicIssues.filter(
    (i) => i.latitude && i.longitude && !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude)),
  );

  const defaultCenter =
    validCoordinates.length > 0
      ? [parseFloat(validCoordinates[0].longitude), parseFloat(validCoordinates[0].latitude)]
      : [77.5946, 12.9716];

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
            <p className="text-slate-600 mt-3 text-lg max-w-2xl">
              Explore verified civic activity across your neighborhood.
            </p>
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
            <span className="text-sm font-bold uppercase tracking-wider">
              Filters
            </span>
          </div>
          <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={
                  "shrink-0 px-5 py-2 rounded-lg text-sm font-bold transition-all " +
                  (activeFilter === category
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900")
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="h-[550px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 relative">
          <MapboxMap
            height="100%"
            center={defaultCenter}
            zoom={filteredIssues.length > 0 ? 11 : 4}
            markers={filteredIssues.map((issue) => ({
              id: issue.id,
              longitude: parseFloat(issue.longitude),
              latitude: parseFloat(issue.latitude),
              color:
                issue.status === "RESOLVED"
                  ? "#10b981"
                  : ["ASSIGNED", "WORK_STARTED", "WORK_COMPLETED"].includes(
                        issue.status,
                      )
                    ? "#f59e0b"
                    : "#3b82f6",
              popupHTML: `
                <div class="p-2 font-sans">
                  <h4 class="font-bold text-slate-900 text-sm mb-1">${issue.title || "Civic Issue"}</h4>
                  <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                    issue.status === "RESOLVED"
                      ? "bg-teal-50 text-teal-700"
                      : ["ASSIGNED", "WORK_STARTED", "WORK_COMPLETED"].includes(
                            issue.status,
                          )
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                  }">
                    ${issue.status ? issue.status.replace(/_/g, " ") : "Open"}
                  </span>
                  <p class="text-xs text-slate-500 mt-2 font-medium">Category: ${issue.category || "General"}</p>
                </div>
              `,
            }))}
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default CivicIssueMap;
