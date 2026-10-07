import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardMetrics, getAdminIssues } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Activity, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [pendingIssues, setPendingIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, allIssuesData] = await Promise.all([
        getAdminDashboardMetrics(),
        getAdminIssues('ALL')
      ]);
      setMetrics(metricsData);
      
      // Sort all by date desc
      const sorted = [...allIssuesData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentIssues(sorted.slice(0, 5));
      
      const pending = sorted.filter(i => i.status === 'REPORTED');
      setPendingIssues(pending.slice(0, 4));

    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-8 rounded-3xl flex items-center border border-red-100 shadow-sm">
        <AlertCircle className="mr-4" size={32} />
        <div>
          <h3 className="font-extrabold text-xl mb-1">Error Loading Dashboard</h3>
          <p className="font-medium opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="bg-[#0B1F3A] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-white border border-[#1e293b]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaC0ydi0yMGgtMjB2LTJoMjB2LTIwaDJ2MjBoMjB2MmgtMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-blue-300 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
            <span>Admin Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">{user?.name || 'Admin'}</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            Review reported civic issues, monitor community activity, and ensure problems are routed to the right teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/admin/issues?status=REPORTED"
              className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white font-bold py-3.5 px-7 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
            >
              <Search className="mr-2" size={20} strokeWidth={2.5} />
              Review Pending Issues
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "New Reports", value: metrics?.totalIssues || 0, icon: FileText, color: "blue" },
          { label: "Pending Review", value: metrics?.pendingReview || 0, icon: Clock, color: "amber", highlight: true },
          { label: "Approved", value: metrics?.approved || 0, icon: CheckCircle2, color: "teal" },
          { label: "Rejected", value: metrics?.rejected || 0, icon: XCircle, color: "red" }
        ].map((kpi, idx) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 border-blue-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100",
            teal: "bg-teal-50 text-teal-600 border-teal-100",
            red: "bg-red-50 text-red-600 border-red-100",
          }[kpi.color];

          return (
            <div key={idx} className={"bg-white p-6 rounded-3xl shadow-sm border " + (kpi.highlight ? "border-amber-200 ring-2 ring-amber-100" : "border-slate-200") + " hover:shadow-md transition-shadow group relative overflow-hidden"}>
              {kpi.highlight && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>}
              <div className="flex items-center justify-between mb-4">
                <div className={"p-3 rounded-2xl border " + colorStyles + " group-hover:scale-110 transition-transform duration-300"}>
                  <kpi.icon size={22} strokeWidth={2} />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">
                {kpi.value}
              </p>
              <h3 className={"font-semibold text-sm " + (kpi.highlight ? "text-amber-700" : "text-slate-500")}>{kpi.label}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Review Section (Priority) */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px] relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-500"></div>
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Clock className="text-amber-500 mr-2.5" size={24} strokeWidth={2.5} />
                Needs Review
              </h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {pendingIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-3xl flex items-center justify-center mb-6 border border-teal-100 shadow-sm">
                  <CheckCircle2 size={36} strokeWidth={2} />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">You're all caught up</h3>
                <p className="text-slate-500">No issues are currently waiting for review.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingIssues.map(issue => (
                  <li key={issue.id} className="p-5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group shadow-sm">
                    <p className="text-xs font-black tracking-widest uppercase text-blue-600 mb-2">{issue.category.name}</p>
                    <h4 className="text-slate-900 font-bold text-lg mb-3 line-clamp-2">{issue.title}</h4>
                    <div className="flex items-center text-xs font-bold text-slate-400 mb-4">
                      <Clock size={14} className="mr-1.5" strokeWidth={2.5} />
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </div>
                    <Link 
                      to={"/admin/issues/" + issue.id}
                      className="text-sm font-bold text-amber-700 bg-amber-100/50 border border-amber-200 hover:bg-amber-200/50 hover:text-amber-800 py-2.5 px-4 rounded-xl flex items-center justify-center transition-colors w-full"
                    >
                      <Search size={16} className="mr-2" strokeWidth={2.5} />
                      Review Issue
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {pendingIssues.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 text-center">
              <Link to="/admin/issues?status=REPORTED" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
                View all pending reviews ({metrics?.pendingReview})
              </Link>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Activity className="text-blue-500 mr-2.5" size={24} strokeWidth={2.5} />
                Recent Reports
              </h2>
            </div>
            <Link to="/admin/issues" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-4 py-2 rounded-xl transition-colors">
              View All <ArrowRight size={16} className="ml-1.5" strokeWidth={2.5} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto p-4 sm:p-6">
            {recentIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                  <FileText size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">No reports found</h3>
                <p className="text-slate-500">There are no issues in the system yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {recentIssues.map(issue => (
                      <tr key={issue.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{issue.title}</div>
                              <div className="text-xs font-black tracking-widest uppercase text-slate-400">{issue.category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-slate-500">
                          {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={"px-3 py-1.5 text-[11px] font-black tracking-wider uppercase rounded-lg border " + getStatusColor(issue.status)}>
                            {issue.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={"/admin/issues/" + issue.id} className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all font-bold">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-400">
            <Activity size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Administrative Controls</h2>
            <p className="text-slate-500 font-medium">Quickly navigate to frequent administrative tasks.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/admin/issues"
            className="whitespace-nowrap px-8 py-3.5 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm"
          >
            Issue Directory
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
