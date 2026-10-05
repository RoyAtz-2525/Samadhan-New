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
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-indigo-100 text-indigo-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "ASSIGNED":
        return "bg-purple-100 text-purple-800";
      case "WORK_STARTED":
      case "WORK_COMPLETED":
        return "bg-cyan-100 text-cyan-800";
      case "UNDER_VERIFICATION":
        return "bg-amber-100 text-amber-800";
      case "RESOLVED":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Keep top 4 recent issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#E0F2FE] to-[#EFF6FF] rounded-2xl p-8 md:p-12 shadow-sm border border-[#BAE6FD] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mb-4">
            Make Your City Better
          </h1>
          <p className="text-lg text-[#0F172A] mb-8">
            Report issues. Track progress. Build stronger communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/citizen/report-issue"
              className="inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="mr-2" size={20} />
              Report a New Issue
            </Link>
            <Link
              to="/citizen/issues"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#0F172A] border border-[#E2E8F0] font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              <List className="mr-2" size={20} />
              View My Issues
            </Link>
          </div>
        </div>

        {/* Subtle decorative elements for the hero */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-[#BAE6FD] opacity-50 hidden md:block">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
          </svg>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <FileText size={18} className="mr-2 text-[#3B82F6]" />
            <h3 className="font-medium text-sm">My Issues</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">
            {loading ? "-" : kpis.total}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <CheckCircle2 size={18} className="mr-2 text-[#16A34A]" />
            <h3 className="font-medium text-sm">Resolved</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">
            {loading ? "-" : kpis.resolved}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <Clock size={18} className="mr-2 text-[#0F9D8A]" />
            <h3 className="font-medium text-sm">In Progress</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">
            {loading ? "-" : kpis.inProgress}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <AlertCircle size={18} className="mr-2 text-[#F59E0B]" />
            <h3 className="font-medium text-sm">Under Review</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">
            {loading ? "-" : kpis.underReview}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Updates */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0F172A]">Recent Updates</h2>
            <Link
              to="/citizen/issues"
              className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] flex items-center"
            >
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-4"
                  >
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 text-[#64748B] rounded-full flex items-center justify-center mb-4 border border-[#E2E8F0]">
                  <FileText size={32} />
                </div>
                <h3 className="text-[#0F172A] font-medium text-lg mb-1">
                  No issues reported yet
                </h3>
                <p className="text-[#64748B] mb-6">
                  Report your first issue to see it here.
                </p>
                <Link
                  to="/citizen/report-issue"
                  className="text-[#3B82F6] font-medium hover:underline"
                >
                  Report your first issue
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {recentIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className="p-4 sm:p-6 hover:bg-[#F5F7FA] transition-colors group"
                  >
                    <Link
                      to={`/citizen/issues/${issue.id}`}
                      className="flex items-start justify-between"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#3B82F6] flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-blue-100 transition-colors">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#64748B] mb-1">
                            {issue.category.name}
                          </p>
                          <h4 className="text-[#0F172A] font-semibold mb-2">
                            {issue.title}
                          </h4>
                          <span className="text-xs text-[#64748B] flex items-center">
                            <Clock size={12} className="mr-1" />
                            {formatDistanceToNow(new Date(issue.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border border-transparent ${getStatusColor(issue.status)}`}
                      >
                        {issue.status.replace(/_/g, " ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Issue Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0F172A]">Issue Map</h2>
            <button className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB]">
              View Full Map
            </button>
          </div>
          <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center text-[#3B82F6] mb-4 border border-[#E2E8F0]">
              <Map size={36} />
            </div>
            <h3 className="font-medium text-[#0F172A] mb-2 text-lg">
              See issues in your area
            </h3>
            <p className="text-sm text-[#64748B] text-center max-w-[200px]">
              Interactive map visualization will be integrated here soon.
            </p>
          </div>
        </div>
      </div>

      {/* Community CTA */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-teal-50 text-[#0F9D8A] rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">
              Together for a Cleaner, Safer Community
            </h2>
            <p className="text-[#64748B]">
              Every reported issue helps make our community better.
            </p>
          </div>
        </div>
        <button className="whitespace-nowrap px-6 py-3 bg-white text-[#0F9D8A] font-medium border-2 border-[#0F9D8A] rounded-xl hover:bg-teal-50 transition-colors">
          Explore Civic Connect
        </button>
      </div>
    </div>
  );
};

export default CitizenDashboard;
