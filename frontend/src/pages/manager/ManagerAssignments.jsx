import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, AlertCircle, Search, Filter, Clock, ChevronRight, User, MapPin, IndianRupee, RefreshCw } from 'lucide-react';
import managerService from '../../services/managerService';
import { format } from 'date-fns';

const ManagerAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerService.getAssignments();
      setAssignments(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
      'ACCEPTED': 'bg-purple-50 text-purple-700 border-purple-200',
      'WORK_STARTED': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'WORK_COMPLETED': 'bg-teal-50 text-teal-700 border-teal-200',
      'COMPLETED': 'bg-green-50 text-green-700 border-green-200',
      'CANCELLED': 'bg-slate-50 text-slate-700 border-slate-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] mb-2 tracking-tight">Work Assignments</h1>
          <p className="text-[#64748B] text-lg">Manage field workers and track assignment progress.</p>
        </div>
        <button 
          onClick={fetchAssignments}
          className="p-3 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh assignments"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-[#0F9D8A]" : "text-[#64748B]"} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center border border-red-100 shadow-sm">
          <AlertCircle className="mr-3 flex-shrink-0" size={24} />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={fetchAssignments} className="text-red-700 font-bold hover:underline px-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between min-h-[250px] animate-pulse">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
              </div>
              <div className="h-12 bg-slate-50 rounded-xl w-full border border-slate-100 mt-4"></div>
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-10 w-10 text-[#64748B] opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">No Active Assignments</h3>
          <p className="text-[#64748B] max-w-sm mx-auto mb-8">
            You haven't assigned any workers to issues yet. Check the issues pipeline to start assigning.
          </p>
          <Link 
            to="/manager/issues" 
            className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors shadow-sm"
          >
            View Approved Issues
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:border-[#0B1F3A] transition-all flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h3 className="text-lg font-black text-[#0F172A] line-clamp-2 leading-snug" title={assignment.issue?.title}>
                    {assignment.issue?.title || 'Unknown Issue'}
                  </h3>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shrink-0 ${getStatusStyle(assignment.status)}`}>
                    {getStatusLabel(assignment.status)}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <div className="w-10 h-10 rounded-full bg-[#0F9D8A]/10 flex items-center justify-center border border-[#0F9D8A]/20 mr-3 shrink-0">
                      <User size={18} className="text-[#0F9D8A]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Assigned To</p>
                      <p className="font-bold text-[#0F172A]">{assignment.worker?.user?.name || 'Unknown Worker'}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-[#334155] bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin size={16} className="text-[#64748B] mr-2 shrink-0" />
                    <span className="font-medium truncate" title={assignment.issue?.address}>
                      {assignment.issue?.address || 'Address not provided'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-medium text-[#64748B]">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1.5 opacity-70" />
                      {format(new Date(assignment.assignedDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-[#E2E8F0] flex justify-between items-center group-hover:bg-[#0B1F3A]/5 transition-colors">
                <div className="flex items-center">
                  <IndianRupee size={16} className="text-[#0F9D8A] mr-1" />
                  <span className="font-black text-[#0F172A]">{assignment.assignedRate}</span>
                </div>
                <Link 
                  to={`/manager/assignments/${assignment.id}`} 
                  className="text-sm text-[#0B1F3A] font-bold inline-flex items-center bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg group-hover:border-[#0B1F3A] transition-colors"
                >
                  Manage <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerAssignments;
