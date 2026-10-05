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
      'REPORTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'UNDER_REVIEW': 'bg-amber-100 text-amber-800 border-amber-200',
      'APPROVED': 'bg-teal-100 text-teal-800 border-teal-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'ASSIGNED': 'bg-purple-100 text-purple-800 border-purple-200',
      'ACCEPTED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'IN_PROGRESS': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'WORK_STARTED': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'COMPLETED': 'bg-teal-100 text-teal-800 border-teal-200',
      'WORK_COMPLETED': 'bg-teal-100 text-teal-800 border-teal-200',
      'UNDER_VERIFICATION': 'bg-amber-100 text-amber-800 border-amber-200',
      'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-slate-100 text-slate-800 border-slate-200',
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Hero */}
      <div className="bg-[#0B1F3A] rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="px-8 py-10 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Good Morning, {user?.name || 'Manager'} 👋
            </h1>
            <p className="text-[#0F9D8A] text-lg font-medium">
              Manage assignments, monitor field operations, and keep civic work moving.
            </p>
          </div>
          <div className="hidden md:block p-4 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
            <Activity className="w-12 h-12 text-white opacity-80" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Approved Issues', value: metrics?.approvedIssues || 0, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', link: '/manager/issues' },
          { label: 'Active Assignments', value: metrics?.activeAssignments || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', link: '/manager/assignments' },
          { label: 'Available Workers', value: metrics?.availableWorkers || 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', link: '/manager/workers' },
          { label: 'Pending Verifications (Before)', value: metrics?.pendingVerifications || 0, icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', link: '/manager/verifications/before' },
          { label: 'Pending Verifications (After)', value: metrics?.pendingAfterVerifications || 0, icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', link: '/manager/verifications/after' }
        ].map((stat, index) => (
          <Link key={index} to={stat.link} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all group flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-[#64748B]">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) - Active Assignments & Map Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Assignments */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A] flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-[#3B82F6]" />
                  Active Assignments
                </h2>
                <p className="text-sm text-[#64748B] mt-1">Ongoing field work and recent updates</p>
              </div>
              <Link to="/manager/assignments" className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                View All <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="p-0 overflow-x-auto">
              {assignments.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Issue</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Worker</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-[#0F172A] truncate max-w-xs">{assignment.issue?.title || 'Unknown Issue'}</div>
                              <div className="text-xs text-[#64748B] mt-1 flex items-center">
                                <Clock size={12} className="mr-1" />
                                Assigned {formatDistanceToNow(new Date(assignment.assignedDate), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3 border border-white shadow-sm">
                              {assignment.worker?.user?.email?.charAt(0).toUpperCase() || 'W'}
                            </div>
                            <div className="text-sm text-[#334155] font-medium">
                              {assignment.worker?.user?.email ? assignment.worker.user.email.split('@')[0] : 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(assignment.status)}`}>
                            {getStatusLabel(assignment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/manager/assignments/${assignment.id}`} className="text-[#3B82F6] hover:text-[#2563EB] inline-flex items-center font-semibold">
                            View <ChevronRight size={14} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg">No active assignments</p>
                  <p className="text-gray-400 text-sm mt-1">Assignments will appear here once created.</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#0F9D8A]" />
                Issue Location Map
              </h2>
            </div>
            <div className="h-64 bg-slate-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="text-center z-10">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Map visualization coming soon</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Narrower) - Pending Actions & Quick Links */}
        <div className="space-y-8">
          
          {/* Pending Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                Needs Attention
              </h2>
              <p className="text-sm text-[#64748B] mt-1">Pending actions requiring your input</p>
            </div>
            <div className="p-0">
              {beforeVerifications.length > 0 ? (
                <ul className="divide-y divide-[#E2E8F0]">
                  {beforeVerifications.map(ver => (
                    <li key={ver.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <CircleDot className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="ml-3 w-full">
                          <p className="text-sm font-semibold text-[#0F172A]">Before-Work Verification</p>
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-1">
                            Issue: {ver.assignment?.issue?.title || 'Unknown'}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                              {format(new Date(ver.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <Link 
                              to={`/manager/verifications/before/${ver.id}`}
                              className="text-xs font-bold text-[#3B82F6] hover:text-[#2563EB] uppercase tracking-wide"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-gray-500 font-medium">You're all caught up!</p>
                  <p className="text-gray-400 text-xs mt-1">No pending verifications found.</p>
                </div>
              )}
              {metrics?.pendingVerifications > 5 && (
                <Link to="/manager/verifications/before" className="block w-full p-3 text-center text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">
                  View all {metrics.pendingVerifications} pending verifications
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <h2 className="text-lg font-bold text-[#0F172A]">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <Link to="/manager/issues" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                <AlertCircle className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-2" />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700">Assign Worker</span>
              </Link>
              <Link to="/manager/workers" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-green-50 hover:border-green-200 transition-colors group">
                <Users className="w-6 h-6 text-slate-400 group-hover:text-green-600 mb-2" />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-green-700">View Workers</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
