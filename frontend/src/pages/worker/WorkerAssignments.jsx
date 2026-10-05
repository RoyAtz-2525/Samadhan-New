import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Search, Filter, AlertCircle, MapPin, Calendar, IndianRupee, ChevronRight, UserCheck } from 'lucide-react';
import workerService from '../../services/workerService';
import { format } from 'date-fns';

const WorkerAssignments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const filters = statusFilter ? { status: statusFilter } : {};
        const response = await workerService.getAssignments(filters);
        setAssignments(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [statusFilter]);

  const handleFilterChange = (e) => {
    if (e.target.value) {
      setSearchParams({ status: e.target.value });
    } else {
      setSearchParams({});
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
      'ACCEPTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'IN_PROGRESS': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'COMPLETED': 'bg-teal-100 text-teal-800 border-teal-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">My Assignments</h1>
          <p className="text-[#64748B] mt-1 text-sm">Manage your tasks and track progress</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-sm">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-[#64748B]" />
            </div>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-10 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-[#F8FAFC] transition-colors appearance-none font-medium text-[#0F172A]"
            >
              <option value="">Status: All Assignments</option>
              <option value="PENDING">Status: Pending</option>
              <option value="ACCEPTED">Status: Accepted</option>
              <option value="IN_PROGRESS">Status: In Progress</option>
              <option value="COMPLETED">Status: Completed</option>
              <option value="REJECTED">Status: Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#64748B]" />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            className="block w-full pl-10 pr-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:ring-[#3B82F6] focus:border-[#3B82F6] bg-white transition-colors"
            readOnly
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-64 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
              <div className="space-y-3 flex-1 mt-4">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-full mt-4 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-[#64748B]" />
          </div>
          <p className="text-[#0F172A] font-bold text-xl mb-2">No assignments found</p>
          <p className="text-[#64748B] text-sm max-w-sm mx-auto">
            {statusFilter 
              ? `There are currently no assignments with the status "${getStatusLabel(statusFilter)}".` 
              : "You don't have any assignments yet."}
          </p>
          {statusFilter && (
            <button 
              onClick={() => setSearchParams({})}
              className="mt-6 px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors font-semibold shadow-sm text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 mb-2">
                      {assignment.issue?.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="text-lg font-bold text-[#0F172A] leading-tight line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                      {assignment.issue?.title || 'Unknown Issue'}
                    </h3>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(assignment.status)}`}>
                    {getStatusLabel(assignment.status)}
                  </span>
                </div>
                
                <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-start text-sm">
                    <MapPin size={16} className="text-[#64748B] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-[#334155] line-clamp-2">{assignment.issue?.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="text-[#64748B] mr-2 flex-shrink-0" />
                    <span className="text-[#334155]">Assigned {format(new Date(assignment.assignedDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-semibold text-[#0F9D8A]">
                      <IndianRupee size={16} className="mr-1" />
                      <span>{assignment.assignedRate?.toLocaleString() || '0'}</span>
                    </div>
                    {assignment.issue?.priority && (
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        assignment.issue.priority === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                        assignment.issue.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                        'bg-slate-50 text-slate-500'
                      }`}>
                        {assignment.issue.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-4 flex justify-between items-center">
                <div className="text-xs font-medium text-[#64748B]">
                  ID: #{assignment.id.substring(0, 8)}
                </div>
                <Link 
                  to={`/worker/assignments/${assignment.id}`}
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                    assignment.status === 'PENDING'
                      ? 'bg-[#3B82F6] hover:bg-[#2563eb] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {assignment.status === 'PENDING' ? 'Take Action' : 'View Details'}
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerAssignments;
