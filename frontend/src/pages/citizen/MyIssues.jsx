import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyIssues } from '../../services/issueService';
import { Filter, Eye, AlertCircle, Clock, MapPin, Search, Plus, Map, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchIssues();
  }, [statusFilter]);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyIssues(statusFilter);
      setIssues(data);
    } catch (err) {
      setError('Failed to fetch your issues');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      REPORTED: 'bg-blue-50 text-blue-700 border-blue-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      WORK_STARTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      UNDER_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      REPORTED: 'Reported',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      ASSIGNED: 'Assigned',
      WORK_STARTED: 'In Progress',
      WORK_COMPLETED: 'Work Completed',
      UNDER_VERIFICATION: 'Under Review',
      RESOLVED: 'Resolved'
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B1F3A] mb-2">My Issues</h1>
          <p className="text-[#64748B] text-lg">Track the civic issues you have reported and follow their progress.</p>
        </div>
        <Link
          to="/citizen/report-issue"
          className="inline-flex items-center px-5 py-2.5 bg-[#0B1F3A] text-white rounded-xl font-semibold hover:bg-[#12345B] transition-all shadow-lg shadow-[#0B1F3A]/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} className="mr-2" />
          Report an Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center text-[#64748B] font-medium mr-2">
          <Filter size={20} className="mr-2" />
          Filter by Status:
        </div>
        <div className="relative w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none bg-slate-50 border border-[#E2E8F0] text-[#0F172A] text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0F9D8A] focus:border-transparent font-medium cursor-pointer transition-all hover:bg-slate-100"
          >
            <option value="ALL">All Issues</option>
            <option value="REPORTED">Reported</option>
            <option value="APPROVED">Approved</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="WORK_STARTED">In Progress</option>
            <option value="UNDER_VERIFICATION">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748B]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center border border-red-100">
          <AlertCircle className="mr-3 flex-shrink-0" size={24} />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={fetchIssues} className="text-red-700 font-bold hover:underline px-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-64 animate-pulse flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-2/3 h-6 bg-slate-200 rounded-md"></div>
                <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
              </div>
              <div className="w-1/2 h-4 bg-slate-100 rounded-md mb-6"></div>
              <div className="space-y-3 mb-auto">
                <div className="w-full h-4 bg-slate-100 rounded-md"></div>
                <div className="w-4/5 h-4 bg-slate-100 rounded-md"></div>
              </div>
              <div className="w-full h-10 bg-slate-100 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] py-20 px-4 text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin size={48} className="text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-[#0B1F3A] mb-3">No Issues Reported Yet</h3>
          <p className="text-[#64748B] text-lg max-w-md mx-auto mb-8">
            {statusFilter === 'ALL' 
              ? "You haven't reported any civic issues yet. Help improve your community by reporting your first issue."
              : `You don't have any issues with the status "${getStatusLabel(statusFilter)}".`
            }
          </p>
          {statusFilter === 'ALL' ? (
            <Link
              to="/citizen/report-issue"
              className="inline-flex items-center px-6 py-3 bg-[#0F9D8A] text-white rounded-xl font-semibold hover:bg-[#0d8777] transition-all shadow-lg shadow-[#0F9D8A]/20 hover:-translate-y-0.5"
            >
              <Plus size={20} className="mr-2" />
              Report an Issue
            </Link>
          ) : (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="inline-flex items-center px-6 py-3 bg-white border border-[#E2E8F0] text-[#0B1F3A] rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <Link 
              key={issue.id} 
              to={`/citizen/issues/${issue.id}`}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="font-bold text-[#0B1F3A] text-lg line-clamp-2 group-hover:text-[#3B82F6] transition-colors leading-tight">
                    {issue.title}
                  </h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap flex-shrink-0 ${getStatusStyle(issue.status)}`}>
                    {getStatusLabel(issue.status)}
                  </span>
                </div>
                
                <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F9D8A] opacity-70"></span>
                  {issue.category?.name || 'Issue'}
                </div>

                <div className="space-y-2.5 text-sm text-[#64748B] mb-6">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2.5 text-slate-400 flex-shrink-0" />
                    <span>{format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {(issue.address || (issue.latitude && issue.longitude)) && (
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-2.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}</span>
                    </div>
                  )}

                  {issue.images && issue.images.length > 0 && (
                     <div className="flex items-center text-slate-500">
                       <ImageIcon size={16} className="mr-2.5 text-slate-400 flex-shrink-0" />
                       <span>{issue.images.length} attachment{issue.images.length !== 1 ? 's' : ''}</span>
                     </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-[#64748B]">ID: #{issue.id.substring(0, 8)}</span>
                <span className="text-sm font-semibold text-[#3B82F6] flex items-center group-hover:translate-x-1 transition-transform">
                  View Details <Eye size={16} className="ml-1.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
