import React, { useState, useEffect } from "react";
import MapboxMap from '../../components/maps/MapboxMap';
import { Link } from "react-router-dom";
import {
  PlusCircle,
  List,
  ArrowRight,
  Map,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyIssues } from "../../services/issueService";
import { formatDistanceToNow } from "date-fns";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const data = await getMyIssues("ALL");
      setIssues(data);
    } catch {
      console.error("Failed to fetch citizen issues.");
    } finally {
      setLoading(false);
    }
  };

  const kpis = {
    total: issues.length,
    resolved: issues.filter((i) => i.status === "RESOLVED").length,
    inProgress: issues.filter((i) =>
      [
        "ASSIGNED",
        "WORK_STARTED",
        "WORK_COMPLETED",
        "UNDER_VERIFICATION",
      ].includes(i.status),
    ).length,
    underReview: issues.filter((i) =>
      ["REPORTED", "APPROVED"].includes(i.status),
    ).length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REPORTED":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "APPROVED":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "ASSIGNED":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "WORK_STARTED":
      case "WORK_COMPLETED":
        return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
      case "UNDER_VERIFICATION":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "RESOLVED":
        return "bg-teal-500/10 text-teal-700 border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-700 border-slate-500/20";
    }
  };

  // Keep top 4 recent issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="bg-[#0B1F3A] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-white border border-[#1e293b]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaC0ydi0yMGgtMjB2LTJoMjB2LTIwaDJ2MjBoMjB2MmgtMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>        {/* Issue Map */}
          <div className="bg-[#0B1F3A] rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-[#1e293b]">
            <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10">
              <h2 className="text-xl font-extrabold text-white">Area Map</h2>
            </div>
            
            <div className="flex-1 w-full relative">
              <MapboxMap 
                height="100%"
                center={recentIssues.length > 0 && recentIssues[0].latitude ? [recentIssues[0].longitude, recentIssues[0].latitude] : [78.9629, 20.5937]}
                zoom={recentIssues.length > 0 ? 12 : 4}
                markers={recentIssues.filter(i => i.latitude && i.longitude).map(i => ({
                  id: i.id || i._id,
                  longitude: parseFloat(i.longitude),
                  latitude: parseFloat(i.latitude),
                  color: i.status === 'RESOLVED' ? '#10b981' : i.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b',
                  popupHTML: `
                    <div class="text-sm font-sans p-1">
                      <p class="font-bold mb-1">${i.title}</p>
                      <p class="text-xs text-gray-500 mb-2">${i.category || 'Issue'}</p>
                      <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white" 
                        style="background-color: ${i.status === 'RESOLVED' ? '#10b981' : i.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b'}">
                        ${i.status}
                      </span>
                    </div>
                  `
                }))}
                className="absolute inset-0"
              />
            </div>
          </div>{/* Issue Map Placeholder */}
        <div className="bg-[#0B1F3A] rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-[#1e293b]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
          
          <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10">
            <h2 className="text-xl font-extrabold text-white">Area Map</h2>
            <button className="text-sm font-bold text-teal-400 hover:text-teal-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
              Expand
            </button>
          </div>
          
          <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[300px] relative z-10 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-teal-400 border border-white/20 relative z-10">
                <Map size={36} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="font-bold text-white mb-2 text-xl">
              Neighborhood Overview
            </h3>
            <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">
              Interactive map visualization coming in the next update.
            </p>
          </div>
        </div>
      </div>

      {/* Community CTA */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8 text-white border border-teal-400/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2MjBoLTJ2LTIwaC0yMHYtMmgyMHYtMjBoMnYyMGgyMHYyaC0yMHoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner">
            <CheckCircle2 size={32} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold mb-2 tracking-tight">
              Together for a Cleaner Community
            </h2>
            <p className="text-teal-50 font-medium text-lg opacity-90">
              Every reported issue helps make our city better.
            </p>
          </div>
        </div>
        
        <Link to="/civic-connect" className="relative z-10 whitespace-nowrap px-8 py-4 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#1a2e4a] transition-colors shadow-xl border border-[#1e293b]">
          Explore Civic Connect
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboard;


