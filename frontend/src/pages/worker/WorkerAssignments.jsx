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
      'PENDING': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      'ACCEPTED': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'IN_PROGRESS': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      'COMPLETED': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      'REJECTED': 'bg-red-500/10 text-red-700 border-red-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Assignments</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your tasks and track progress</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-sm">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" strokeWidth={2.5} />
            </div>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="block w-full pl-11 pr-10 py-3 text-sm border border-slate-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-colors appearance-none font-bold text-slate-700"
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
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search assignments..."
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors font-medium"
            readOnly
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 h-64 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-slate-200 rounded-lg w-2/3 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded-lg w-1/4 animate-pulse"></div>
              </div>
              <div className="space-y-3 flex-1 mt-4">
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6 animate-pulse"></div>
              </div>
              <div className="h-10 bg-slate-200 rounded-xl w-full mt-4 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" strokeWidth={2.5} />
          <p className="font-bold">{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-slate-900 font-extrabold text-2xl mb-2">No assignments found</p>
          <p className="text-slate-500 text-base font-medium max-w-md mx-auto">
            {statusFilter 
              ? "There are currently no assignments with the status " + getStatusLabel(statusFilter) + "." : "You don't have any assignments yet."}
          </p>
          {statusFilter && (
            <button 
              onClick={() => setSearchParams({})}
              className="mt-8 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-50 transition-colors font-bold shadow-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col group">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 mb-3">
                      {assignment.issue?.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {assignment.issue?.title || 'Unknown Issue'}
                    </h3>
                  </div>
                  <span className={"flex-shrink-0 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg border " + getStatusColor(assignment.status)}>
                    {getStatusLabel(assignment.status)}
                  </span>
                </div>
                
                <div className="space-y-3 mt-auto pt-5 border-t border-slate-100">
                  <div className="flex items-start text-sm">
                    <MapPin size={18} className="text-slate-400 mr-3 flex-shrink-0" strokeWidth={2} />
                    <span className="text-slate-700 font-medium line-clamp-2">{assignment.issue?.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar size={18} className="text-slate-400 mr-3 flex-shrink-0" strokeWidth={2} />
                    <span className="text-slate-700 font-medium">Assigned {format(new Date(assignment.assignedDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center text-sm font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                      <IndianRupee size={16} className="mr-1" strokeWidth={2.5} />
                      <span>{assignment.assignedRate?.toLocaleString() || '0'}</span>
                    </div>
                    {assignment.issue?.priority && (
                      <span className={"text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider border " + (
                        assignment.issue.priority === 'CRITICAL' ? "bg-red-50 text-red-600 border-red-200" :
                        assignment.issue.priority === 'HIGH' ? "bg-orange-50 text-orange-600 border-orange-200" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        {assignment.issue.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ID: #{assignment.id.substring(0, 8)}
                </div>
                <Link 
                  to={"/worker/assignments/" + assignment.id}
                  className={"inline-flex items-center px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm " + (
                    assignment.status === 'PENDING'
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {assignment.status === 'PENDING' ? 'Take Action' : 'View Details'}
                  <ChevronRight size={18} className="ml-1" strokeWidth={2.5} />
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

