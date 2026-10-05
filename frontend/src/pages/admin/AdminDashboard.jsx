import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardMetrics, getAdminIssues } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Activity } from 'lucide-react';
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
      case 'REPORTED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'WORK_STARTED':
      case 'WORK_COMPLETED': return 'bg-cyan-100 text-cyan-800';
      case 'UNDER_VERIFICATION': return 'bg-amber-100 text-amber-800';
      case 'RESOLVED': return 'bg-teal-100 text-teal-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-center border border-red-100">
        <AlertCircle className="mr-3" size={24} />
        <div>
          <h3 className="font-bold text-lg">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#12345B] rounded-2xl p-8 md:p-12 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Welcome, {user?.name || 'Admin'}</h1>
          <p className="text-lg text-slate-300 mb-8">Review reported civic issues and help keep the community moving.</p>
          <div className="flex gap-4">
            <Link 
              to="/admin/issues?status=REPORTED"
              className="inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              <Clock className="mr-2" size={20} />
              Review Pending Issues
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-white opacity-10 hidden md:block">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
          </svg>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <FileText size={18} className="mr-2 text-[#3B82F6]" />
            <h3 className="font-medium text-sm">New Reports</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{metrics?.totalIssues || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#F59E0B]"></div>
          <div className="flex items-center text-[#64748B] mb-2">
            <Clock size={18} className="mr-2 text-[#F59E0B]" />
            <h3 className="font-medium text-sm text-[#0F172A]">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{metrics?.pendingReview || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <CheckCircle2 size={18} className="mr-2 text-[#16A34A]" />
            <h3 className="font-medium text-sm">Approved</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{metrics?.approved || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <div className="flex items-center text-[#64748B] mb-2">
            <XCircle size={18} className="mr-2 text-[#DC2626]" />
            <h3 className="font-medium text-sm">Rejected</h3>
          </div>
          <p className="text-3xl font-bold text-[#0F172A]">{metrics?.rejected || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Review Section (Priority) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-amber-50/30">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center">
              <Clock className="text-[#F59E0B] mr-2" size={20} />
              Needs Review
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {pendingIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <CheckCircle2 size={48} className="text-[#16A34A] mb-4 opacity-50" />
                <h3 className="text-[#0F172A] font-medium text-lg mb-1">You're all caught up</h3>
                <p className="text-[#64748B]">No issues are currently waiting for review.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {pendingIssues.map(issue => (
                  <li key={issue.id} className="p-5 hover:bg-[#F5F7FA] transition-colors group">
                    <p className="text-xs font-semibold text-[#3B82F6] mb-1">{issue.category.name}</p>
                    <h4 className="text-[#0F172A] font-semibold mb-2">{issue.title}</h4>
                    <div className="flex items-center text-xs text-[#64748B] mb-3">
                      <Clock size={12} className="mr-1" />
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </div>
                    <Link 
                      to={`/admin/issues/${issue.id}`}
                      className="text-sm font-medium text-white bg-[#0F9D8A] hover:bg-[#0d8575] py-2 px-4 rounded-lg block text-center transition-colors shadow-sm"
                    >
                      Review Issue
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {pendingIssues.length > 0 && (
            <div className="p-4 border-t border-[#E2E8F0] bg-gray-50 text-center">
              <Link to="/admin/issues?status=REPORTED" className="text-sm font-medium text-[#3B82F6] hover:underline">
                View all pending
              </Link>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center">
              <Activity className="text-[#3B82F6] mr-2" size={20} />
              Recent Reports
            </h2>
            <Link to="/admin/issues" className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {recentIssues.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <FileText size={48} className="text-[#64748B] mb-4 opacity-30" />
                <h3 className="text-[#0F172A] font-medium text-lg mb-1">No reports found</h3>
                <p className="text-[#64748B]">There are no issues in the system yet.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F5F7FA]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {recentIssues.map(issue => (
                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="ml-0">
                            <div className="text-sm font-medium text-[#0F172A] line-clamp-1">{issue.title}</div>
                            <div className="text-xs text-[#64748B]">{issue.category.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border border-transparent ${getStatusColor(issue.status)}`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admin/issues/${issue.id}`} className="text-[#3B82F6] hover:text-[#2563EB] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] mb-1">Administrative Controls</h2>
          <p className="text-[#64748B] text-sm">Quickly navigate to frequent administrative tasks.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/admin/issues"
            className="whitespace-nowrap px-6 py-2.5 bg-white text-[#0F172A] font-medium border border-[#E2E8F0] rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Issue Directory
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
