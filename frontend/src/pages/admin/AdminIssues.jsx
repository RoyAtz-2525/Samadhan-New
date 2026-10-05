import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAdminIssues } from '../../services/adminService';
import { AlertCircle, Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';

const AdminIssues = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  useEffect(() => {
    fetchIssues(statusFilter);
  }, [statusFilter]);

  const fetchIssues = async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminIssues(status);
      setIssues(data);
    } catch (err) {
      setError('Failed to load issues. Please check your connection and permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setSearchParams(newStatus === 'ALL' ? {} : { status: newStatus });
  };

  const getStatusStyle = (status) => {
    const styles = {
      REPORTED: 'bg-blue-50 text-blue-700 border-blue-200',
      UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      WORK_STARTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      UNDER_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
      WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      REPORTED: 'Reported',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      ASSIGNED: 'Assigned',
      WORK_STARTED: 'In Progress',
      UNDER_VERIFICATION: 'Under Verification',
      WORK_COMPLETED: 'Work Completed',
      RESOLVED: 'Resolved'
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-[#DC2626] font-black bg-red-50 px-2 py-0.5 rounded border border-red-100';
      case 'HIGH': return 'text-[#F59E0B] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100';
      case 'MEDIUM': return 'text-[#3B82F6] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100';
      case 'LOW': return 'text-[#16A34A] font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100';
      default: return 'text-[#64748B] font-medium';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] mb-2 tracking-tight">Review Civic Issues</h1>
          <p className="text-[#64748B] text-lg max-w-2xl">Review reported civic issues, verify information, and decide what should move forward.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => fetchIssues(statusFilter)}
            className="p-3 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh issues"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-[#0F9D8A]" : "text-[#64748B]"} />
          </button>
          
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="text-[#64748B]" size={18} />
            </div>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="w-full appearance-none bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-4 focus:ring-[#0B1F3A]/10 focus:border-[#0B1F3A] font-bold cursor-pointer transition-all hover:border-slate-300 shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported (New)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="WORK_STARTED">Work Started</option>
              <option value="WORK_COMPLETED">Work Completed</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#64748B]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center border border-red-100 shadow-sm">
          <AlertCircle className="mr-3 flex-shrink-0" size={24} />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={() => fetchIssues(statusFilter)} className="text-red-700 font-bold hover:underline px-2">Retry</button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm overflow-hidden rounded-3xl border border-[#E2E8F0]">
        {loading ? (
          <div className="divide-y divide-[#E2E8F0]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center animate-pulse">
                <div className="w-1/4 pr-4">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="w-1/4 px-4">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
                <div className="w-1/4 px-4">
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="w-1/4 pl-4 flex justify-end">
                  <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-[#64748B] opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">No Issues Found</h3>
            <p className="text-[#64748B] max-w-sm mx-auto">
              {statusFilter === 'ALL' 
                ? "There are currently no civic issues reported in the system."
                : `No issues found with the status "${getStatusLabel(statusFilter)}". Try adjusting your filters.`}
            </p>
            {statusFilter !== 'ALL' && (
              <button 
                onClick={() => handleFilterChange({target: {value: 'ALL'}})}
                className="mt-6 px-6 py-2.5 bg-white border-2 border-[#E2E8F0] text-[#0B1F3A] rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Issue Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Reporter
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E2E8F0]">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-bold text-[#0F172A] truncate max-w-[200px] lg:max-w-[250px] mb-1" title={issue.title}>
                            {issue.title}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wide">
                              {issue.category?.name}
                            </span>
                            <span className="text-xs font-medium text-[#64748B]">
                              {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#0F172A]">{issue.reporter?.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{issue.reporter?.user?.phone || issue.reporter?.user?.email || 'No contact info'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-[#0F172A] truncate max-w-[200px] lg:max-w-[250px]" title={issue.address || ''}>
                        {issue.address || 'Address not provided'}
                      </div>
                      <div className="text-xs text-[#64748B] font-mono mt-1">
                        {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-2">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusStyle(issue.status)}`}>
                          {getStatusLabel(issue.status)}
                        </span>
                        <span className={`text-xs ${getPriorityStyle(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <Link 
                        to={`/admin/issues/${issue.id}`} 
                        className="inline-flex items-center text-sm font-bold text-[#0B1F3A] bg-white border-2 border-[#E2E8F0] hover:border-[#0B1F3A] px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        <Eye size={16} className="mr-2 text-[#64748B] group-hover:text-[#0B1F3A]" />
                        Review
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
  );
};

export default AdminIssues;
