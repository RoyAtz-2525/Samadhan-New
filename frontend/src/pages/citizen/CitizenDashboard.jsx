import React, { useState, useEffect } from "react";
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-teal-300 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-teal-400"></span>
            <span>Citizen Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Make Your City <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Better</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            Report issues, track progress in real-time, and collaborate with your community to build a cleaner, safer environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/citizen/report-issue"
              className="inline-flex items-center justify-center bg-teal-400 hover:bg-teal-300 text-[#0B1F3A] font-bold py-3.5 px-7 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
            >
              <PlusCircle className="mr-2" size={20} strokeWidth={2.5} />
              Report a New Issue
            </Link>
            <Link
              to="/citizen/issues"
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3.5 px-7 rounded-xl transition-all backdrop-blur-sm hover:-translate-y-0.5"
            >
              <List className="mr-2" size={20} strokeWidth={2.5} />
              View My Issues
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "My Issues", value: kpis.total, icon: FileText, color: "blue" },
          { label: "Resolved", value: kpis.resolved, icon: CheckCircle2, color: "teal" },
          { label: "In Progress", value: kpis.inProgress, icon: Clock, color: "indigo" },
          { label: "Under Review", value: kpis.underReview, icon: AlertCircle, color: "amber" }
        ].map((kpi, idx) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            teal: "bg-teal-50 text-teal-600 border-teal-100",
            indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100",
          }[kpi.color];

          return (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl border group-hover:scale-110 transition-transform duration-300">
                  <kpi.icon size={22} strokeWidth={2} />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">
                {loading ? "-" : kpi.value}
              </p>
              <h3 className="font-semibold text-slate-500 text-sm">{kpi.label}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Updates */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recent Updates</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Track the latest activity on your reports</p>
            </div>
            <Link
              to="/citizen/issues"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center bg-teal-50 px-4 py-2 rounded-xl transition-colors"
            >
              View All <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="flex-1 p-2 sm:p-4">
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-2xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-100 rounded-md w-1/4"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">
                  No issues reported yet
                </h3>
                <p className="text-slate-500 mb-8 max-w-sm">
                  Be the change in your neighborhood. Report your first civic issue and track its resolution here.
                </p>
                <Link
                  to="/citizen/report-issue"
                  className="inline-flex items-center justify-center bg-[#0B1F3A] hover:bg-[#1a2e4a] text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <PlusCircle className="mr-2" size={18} />
                  Report First Issue
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentIssues.map((issue) => (
                  <li key={issue.id}>
                    <Link
                      to={"/citizen/issues/" + (issue._id || issue.id)}
                      className="flex items-start justify-between p-4 sm:p-5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                          <AlertCircle size={22} strokeWidth={2} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1.5">
                            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                              {issue.category.name}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-bold text-slate-400 flex items-center">
                              <Clock size={12} className="mr-1" strokeWidth={2.5} />
                              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <h4 className="text-slate-900 font-bold text-base md:text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {issue.title}
                          </h4>
                          <div className="flex items-center">
                            <span className="px-3 py-1 text-[11px] font-black tracking-wider uppercase rounded-lg border ">
                              {issue.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                        <ArrowRight size={14} strokeWidth={2.5} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Issue Map Placeholder */}
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


