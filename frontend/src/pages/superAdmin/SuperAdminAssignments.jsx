import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { Briefcase, Filter, Calendar, AlertCircle, HardHat, CheckSquare, Currency } from 'lucide-react';

const SuperAdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAssignments(filters);
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
      case 'IN_PROGRESS': return 'bg-blue-50 text-[#3B82F6] border-blue-200';
      case 'ACCEPTED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PENDING': return 'bg-yellow-50 text-[#F59E0B] border-yellow-200';
      default: return 'bg-red-50 text-[#DC2626] border-red-200';
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
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Work Assignments</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor worker assignments and operational progress across SAMADHAN.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0]">
          <Briefcase className="text-[#3B82F6]" size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Total Active</span>
            <span className="text-lg font-bold text-[#0F172A] leading-tight">{assignments.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="w-full sm:w-64 relative group">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5 group-focus-within:text-[#0F9D8A] transition-colors" />
          <select 
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1F3A]"></div>
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No assignments found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            We couldn't find any assignments matching your current filter criteria.
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
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Worker</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Manager</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Rate</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Assigned Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[200px]" title={assignment.issue?.title}>
                            {assignment.issue?.title || 'Unknown Issue'}
                          </span>
                          <span className="text-xs text-[#64748B] font-mono mt-0.5">ID: {assignment.issueId.substring(0,8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#0F172A]">
                          <HardHat size={14} className="mr-2 text-[#64748B]" />
                          <span className="truncate max-w-[150px]">{assignment.worker?.user?.email || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#0F172A]">
                          <CheckSquare size={14} className="mr-2 text-[#64748B]" />
                          <span className="truncate max-w-[150px]">{assignment.manager?.user?.email || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-[#0F172A]">
                          ₹{assignment.assignedRate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(assignment.status)}`}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(assignment.assignedDate)}
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
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight line-clamp-2">
                      {assignment.issue?.title || 'Unknown Issue'}
                    </h3>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">ID: {assignment.issueId.substring(0,8)}</p>
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(assignment.status)}`}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs bg-[#F5F7FA] p-3 rounded-lg border border-[#E2E8F0]">
                  <div>
                    <div className="text-[#64748B] font-medium mb-1">Worker</div>
                    <div className="flex items-center text-[#0F172A] font-semibold">
                      <HardHat size={12} className="mr-1 text-[#3B82F6]" />
                      <span className="truncate">{assignment.worker?.user?.email || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#64748B] font-medium mb-1">Manager</div>
                    <div className="flex items-center text-[#0F172A] font-semibold">
                      <CheckSquare size={12} className="mr-1 text-[#0F9D8A]" />
                      <span className="truncate">{assignment.manager?.user?.email || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center text-[#0F172A] font-bold text-sm">
                    ₹{assignment.assignedRate}
                  </div>
                  <div className="flex items-center text-xs text-[#64748B]">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(assignment.assignedDate)}
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

export default SuperAdminAssignments;
