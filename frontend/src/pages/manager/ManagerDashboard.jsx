import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Briefcase, Users, CheckSquare, ShieldCheck, ChevronRight, MapPin, Clock, CircleDot, Activity } from 'lucide-react';
import managerService from '../../services/managerService';
import { useAuth } from '../../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [beforeVerifications, setBeforeVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [metricsRes, assignmentsRes, beforeVerRes] = await Promise.all([
          managerService.getDashboardMetrics(),
          managerService.getAssignments(),
          managerService.getBeforeWorkVerifications()
        ]);
        
        setMetrics(metricsRes.data || metricsRes);
        setAssignments((assignmentsRes.data || []).slice(0, 5));
        setBeforeVerifications((beforeVerRes.data || []).filter(v => v.status === 'PENDING').slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'REPORTED': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'UNDER_REVIEW': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      'APPROVED': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      'REJECTED': 'bg-red-500/10 text-red-700 border-red-500/20',
      'ASSIGNED': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      'ACCEPTED': 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
      'IN_PROGRESS': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      'WORK_STARTED': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      'COMPLETED': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      'WORK_COMPLETED': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      'UNDER_VERIFICATION': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      'RESOLVED': 'bg-green-500/10 text-green-700 border-green-500/20',
      'CANCELLED': 'bg-slate-500/10 text-slate-700 border-slate-500/20',
      'PENDING': 'bg-amber-500/10 text-amber-700 border-amber-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-3xl p-8 text-center shadow-sm">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-extrabold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Hero */}
      <div className="bg-[#0B1F3A] rounded-3xl overflow-hidden relative shadow-2xl border border-[#1e293b]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaC0ydi0yMGgtMjB2LTJoMjB2LTIwaDJ2MjBoMjB2MmgtMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="px-8 md:px-12 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-teal-300 mb-6 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-teal-400"></span>
              <span>Manager Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{user?.name || 'Manager'}</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Coordinate field workers, verify task completion, and ensure civic issues are resolved efficiently.
            </p>
          </div>
          <div className="hidden md:flex p-6 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
            <Activity className="w-16 h-16 text-teal-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Approved Issues', value: metrics?.approvedIssues || 0, icon: AlertCircle, color: 'blue', link: '/manager/issues' },
          { label: 'Active Assignments', value: metrics?.activeAssignments || 0, icon: Briefcase, color: 'purple', link: '/manager/assignments' },
          { label: 'Available Workers', value: metrics?.availableWorkers || 0, icon: Users, color: 'teal', link: '/manager/workers' },
          { label: 'Before Verification', value: metrics?.pendingVerifications || 0, icon: CheckSquare, color: 'amber', link: '/manager/verifications/before', highlight: true },
          { label: 'After Verification', value: metrics?.pendingAfterVerifications || 0, icon: ShieldCheck, color: 'orange', link: '/manager/verifications/after', highlight: true }
        ].map((stat, index) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100",
            purple: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100",
            teal: "bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100",
            amber: "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100",
            orange: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-100",
          }[stat.color];

          return (
            <Link key={index} to={stat.link} className={"bg-white rounded-3xl p-6 border " + (stat.highlight ? "border-amber-200 ring-2 ring-amber-50" : "border-slate-200") + " shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden"}>
              {stat.highlight && <div className="absolute top-0 right-0 w-2 h-full bg-amber-400"></div>}
              <div className="flex justify-between items-start mb-6">
                <div className={"p-3.5 rounded-2xl border " + colorStyles + " transition-colors duration-300"}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) - Active Assignments & Map Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Assignments */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-purple-500" strokeWidth={2.5} />
                  Active Assignments
                </h2>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto p-4 sm:p-6">
              {assignments.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Issue & Time</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Worker</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-bold text-slate-900 truncate max-w-[200px] mb-1 group-hover:text-purple-600 transition-colors">{assignment.issue?.title || 'Unknown Issue'}</div>
                                <div className="text-xs font-bold text-slate-400 flex items-center">
                                  <Clock size={12} className="mr-1" strokeWidth={2.5} />
                                  Assigned {formatDistanceToNow(new Date(assignment.assignedDate), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center text-xs font-black text-purple-700 mr-3 border border-purple-200">
                                {assignment.worker?.user?.email?.charAt(0).toUpperCase() || 'W'}
                              </div>
                              <div className="text-sm text-slate-700 font-bold">
                                {assignment.worker?.user?.email ? assignment.worker.user.email.split('@')[0] : 'Unknown'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={"px-3 py-1.5 text-[11px] font-black tracking-wider uppercase rounded-lg border " + getStatusColor(assignment.status)}>
                              {getStatusLabel(assignment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={"/manager/assignments/" + assignment.id} className="inline-flex items-center justify-center text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-4 py-2 rounded-xl transition-all font-bold">
                              View <ChevronRight size={16} className="ml-1" strokeWidth={2.5} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                    <CheckSquare className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate-900 font-bold text-xl mb-2">No active assignments</p>
                  <p className="text-slate-500 font-medium max-w-sm">When you assign workers to civic issues, tracking will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-[#0B1F3A] rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-[#1e293b]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10">
              <h2 className="text-xl font-extrabold text-white flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-teal-400" strokeWidth={2.5} />
                Issue Location Map
              </h2>
            </div>
            <div className="h-72 bg-slate-900/50 flex items-center justify-center relative overflow-hidden backdrop-blur-sm z-10">
              <div className="text-center z-10 relative">
                <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-teal-400 border border-white/20 relative z-10 mx-auto mb-6">
                  <MapPin className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-white mb-2 text-xl">Interactive Map</h3>
                <p className="text-slate-400 font-medium">Geospatial visualization coming soon.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Narrower) - Pending Actions & Quick Links */}
        <div className="space-y-8">
          
          {/* Pending Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-amber-50/50">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <AlertCircle className="w-6 h-6 mr-3 text-amber-500" strokeWidth={2.5} />
                Needs Attention
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Pending actions requiring your input</p>
            </div>
            <div className="p-4">
              {beforeVerifications.length > 0 ? (
                <ul className="space-y-3">
                  {beforeVerifications.map(ver => (
                    <li key={ver.id} className="p-5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group shadow-sm">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <CircleDot className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
                        </div>
                        <div className="ml-4 w-full">
                          <p className="text-sm font-black tracking-widest uppercase text-amber-700 mb-1.5">Before-Work Verification</p>
                          <p className="text-base font-bold text-slate-900 line-clamp-2">
                            {ver.assignment?.issue?.title || 'Unknown Issue'}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              {format(new Date(ver.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <Link 
                              to={"/manager/verifications/before/" + ver.id}
                              className="text-xs font-bold text-amber-700 bg-amber-100/50 border border-amber-200 hover:bg-amber-200 hover:text-amber-800 py-2 px-4 rounded-xl transition-colors"
                            >
                              REVIEW
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                    <ShieldCheck className="w-8 h-8 text-green-600" strokeWidth={2} />
                  </div>
                  <p className="text-slate-900 font-bold text-lg mb-1">You're all caught up!</p>
                  <p className="text-slate-500 font-medium text-sm">No pending verifications found.</p>
                </div>
              )}
              {metrics?.pendingVerifications > 5 && (
                <Link to="/manager/verifications/before" className="mt-4 block w-full p-4 text-center text-sm font-bold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200">
                  View all {metrics.pendingVerifications} pending verifications
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link to="/manager/issues" className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1">
                <AlertCircle className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-3 transition-colors" strokeWidth={2} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700 transition-colors">Assign Worker</span>
              </Link>
              <Link to="/manager/workers" className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-200 bg-white hover:bg-green-50 hover:border-green-200 transition-all group shadow-sm hover:shadow-md hover:-translate-y-1">
                <Users className="w-8 h-8 text-slate-300 group-hover:text-green-500 mb-3 transition-colors" strokeWidth={2} />
                <span className="text-sm font-bold text-slate-600 group-hover:text-green-700 transition-colors">View Workers</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
