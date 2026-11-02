import React, { useState, useEffect } from "react";
import MapboxMap from "../../components/maps/MapboxMap";
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
  Award,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMyIssues } from "../../services/issueService";
import { getRewardSummary } from "../../services/rewardService";
import { formatDistanceToNow } from "date-fns";

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rewardData, setRewardData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMyIssues("ALL")
      .then((data) => {
        if (isMounted) setIssues(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch citizen issues.", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    getRewardSummary()
      .then((summary) => {
        if (isMounted) setRewardData(summary);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Keep top 5 recent issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const mappedIssues = issues.filter(
    (i) =>
      i.latitude &&
      i.longitude &&
      !isNaN(parseFloat(i.latitude)) &&
      !isNaN(parseFloat(i.longitude)),
  );

  const mapCenter =
    mappedIssues.length > 0
      ? [parseFloat(mappedIssues[0].longitude), parseFloat(mappedIssues[0].latitude)]
      : [78.9629, 20.5937];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
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
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{user?.name || "Citizen"}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Reports", value: kpis.total, icon: FileText, color: "blue", link: "/citizen/issues" },
          { label: "Under Review", value: kpis.underReview, icon: Clock, color: "amber", link: "/citizen/issues", highlight: true },
          { label: "In Progress", value: kpis.inProgress, icon: AlertCircle, color: "purple", link: "/citizen/issues" },
          { label: "Resolved", value: kpis.resolved, icon: CheckCircle2, color: "teal", link: "/citizen/issues" },
          { label: "Reward Points", value: rewardData?.balance ?? 0, icon: Award, color: "emerald", link: "/citizen/rewards" },
        ].map((kpi, idx) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100",
            purple: "bg-purple-50 text-purple-600 border-purple-100",
            teal: "bg-teal-50 text-teal-600 border-teal-100",
            emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
          }[kpi.color];

          return (
            <Link
              key={idx}
              to={kpi.link}
              className={`bg-white p-6 rounded-3xl shadow-sm border ${
                kpi.highlight ? "border-amber-200 ring-2 ring-amber-100" : "border-slate-200"
              } hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between`}
            >
              {kpi.highlight && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl border ${colorStyles} group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon size={22} strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">
                  {kpi.value}
                </p>
                <h3 className={`font-semibold text-sm ${kpi.highlight ? "text-amber-700" : "text-slate-500"}`}>
                  {kpi.label}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid: Recent Issues & Area Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Issues List */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recent Reports</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Live status of your submitted civic issues</p>
            </div>
            <Link
              to="/citizen/issues"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center bg-teal-50 px-4 py-2 rounded-xl transition-colors"
            >
              View All <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            {recentIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-3xl flex items-center justify-center mb-6 border border-teal-100 shadow-sm">
                  <CheckCircle2 size={36} strokeWidth={2} />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">No issues reported yet</h3>
                <p className="text-slate-500 max-w-sm mb-6">
                  Spot a civic problem in your area? Report it right now and track its resolution in real-time.
                </p>
                <Link
                  to="/citizen/report-issue"
                  className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md"
                >
                  Report Your First Issue
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <ul className="divide-y divide-slate-100 bg-white">
                  {recentIssues.map((issue) => (
                    <li key={issue.id} className="hover:bg-slate-50 transition-colors group">
                      <Link
                        to={`/citizen/issues/${issue.id}`}
                        className="p-5 flex items-center justify-between"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                {issue.category?.name || issue.category || "General"}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-xs font-medium text-slate-400 flex items-center">
                                <Clock size={12} className="mr-1" strokeWidth={2} />
                                {issue.createdAt
                                  ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
                                  : "Recently"}
                              </span>
                            </div>
                            <h4 className="text-slate-900 font-bold text-base group-hover:text-teal-700 transition-colors line-clamp-1">
                              {issue.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1.5 text-[11px] font-black tracking-wider uppercase rounded-lg border ${getStatusColor(
                              issue.status,
                            )}`}
                          >
                            {issue.status.replace(/_/g, " ")}
                          </span>
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 border border-slate-200 items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-200 transition-all">
                            <ArrowRight size={14} strokeWidth={2.5} />
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Area Map */}
        <div className="lg:col-span-1 bg-[#0B1F3A] rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-[#1e293b] min-h-[500px]">
          <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10 bg-[#0B1F3A]/80 backdrop-blur-md">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center">
                <Map className="mr-2 text-teal-400" size={22} />
                My Area Map
              </h2>
              <p className="text-xs text-slate-400 mt-1">Live locations of your reported issues</p>
            </div>
            <Link
              to="/civic-connect"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/10"
            >
              Public Map
            </Link>
          </div>

          <div className="flex-1 w-full relative min-h-[380px]">
            <MapboxMap
              height="100%"
              center={mapCenter}
              zoom={mappedIssues.length > 0 ? 11 : 4}
              markers={mappedIssues.map((i) => ({
                id: i.id,
                longitude: parseFloat(i.longitude),
                latitude: parseFloat(i.latitude),
                color:
                  i.status === "RESOLVED"
                    ? "#10b981"
                    : ["ASSIGNED", "WORK_STARTED", "WORK_COMPLETED"].includes(i.status)
                    ? "#3b82f6"
                    : "#f59e0b",
                popupHTML: `
                  <div class="text-sm font-sans p-1">
                    <p class="font-bold mb-1">${i.title}</p>
                    <p class="text-xs text-gray-500 mb-2">${i.category?.name || i.category || "Issue"}</p>
                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style="background-color: ${
                        i.status === "RESOLVED"
                          ? "#10b981"
                          : ["ASSIGNED", "WORK_STARTED", "WORK_COMPLETED"].includes(i.status)
                          ? "#3b82f6"
                          : "#f59e0b"
                      }">
                      ${i.status}
                    </span>
                  </div>
                `,
              }))}
              className="absolute inset-0"
            />
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

        <Link
          to="/civic-connect"
          className="relative z-10 whitespace-nowrap px-8 py-4 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#1a2e4a] transition-colors shadow-xl border border-[#1e293b]"
        >
          Explore Civic Connect
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboard;
