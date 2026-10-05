import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { Search, Filter, MapPin, Calendar, AlertCircle, List, Tag, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getIssues(filters);
      setIssues(data);
      setError(null);
    } catch (err) {
      setError('Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 text-[#DC2626] border-red-200';
      case 'HIGH': return 'bg-orange-50 text-[#F59E0B] border-orange-200';
      case 'MEDIUM': return 'bg-blue-50 text-[#3B82F6] border-blue-200';
      case 'LOW': return 'bg-green-50 text-[#16A34A] border-green-200';
      default: return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
      case 'REPORTED': return 'bg-blue-50 text-[#3B82F6] border-blue-200';
      case 'CANCELLED': 
      case 'REJECTED': return 'bg-red-50 text-[#DC2626] border-red-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">All Civic Issues</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor the complete civic issue lifecycle across the platform.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0]">
          <List className="text-[#3B82F6]" size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Total Issues</span>
            <span className="text-lg font-bold text-[#0F172A] leading-tight">{issues.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5 group-focus-within:text-[#0F9D8A] transition-colors" />
            <select 
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="WORK_STARTED">Work Started</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <div className="w-full sm:w-64 relative group">
            <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5 group-focus-within:text-[#0B1F3A] transition-colors" />
            <select 
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F9D8A]"></div>
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No issues found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            We couldn't find any issues matching your current filter criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow-sm border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0]">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Issue</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Reporter</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {issues.map(issue => (
                    <tr key={issue.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[200px]" title={issue.title}>
                            {issue.title}
                          </span>
                          <div className="flex items-center mt-1 text-xs text-[#64748B] truncate max-w-[200px]" title={issue.address}>
                            <MapPin size={12} className="mr-1 flex-shrink-0" />
                            {issue.address || 'Location provided'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A]">
                        {issue.reporter?.user?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#64748B]">
                          <Tag size={14} className="mr-1.5 text-[#0F9D8A]" />
                          {issue.category?.name || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getPriorityBadge(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(issue.status)}`}>
                          {issue.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(issue.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight line-clamp-2">
                      {issue.title}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(issue.status)}`}>
                    {issue.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-start text-xs text-[#64748B] bg-[#F5F7FA] p-2 rounded-lg">
                  <MapPin size={14} className="mr-1.5 flex-shrink-0 mt-0.5 text-[#3B82F6]" />
                  <span className="line-clamp-2">{issue.address || 'Location provided'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center text-[#64748B]">
                    <span className="font-semibold mr-1">By:</span> 
                    <span className="truncate max-w-[100px]">{issue.reporter?.user?.email || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border ${getPriorityBadge(issue.priority)}`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                  <div className="flex items-center">
                    <Tag size={12} className="mr-1 text-[#0F9D8A]" />
                    {issue.category?.name || 'General'}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(issue.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminIssues;
