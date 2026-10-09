import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Filter, Search, ShieldCheck, ChevronRight, User, MapPin, Clock, RefreshCw } from 'lucide-react';
import managerService from '../../services/managerService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ManagerAfterWorkVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'PENDING',
    priority: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchVerifications();
  }, [filters]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await managerService.getAfterWorkVerifications(filters);
      if (response.success) {
        setVerifications(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
      'APPROVED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
      'REVISION_REQUESTED': 'bg-orange-50 text-orange-700 border-orange-200'
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
          <h1 className="text-3xl font-black text-[#0B1F3A] mb-2 tracking-tight">After-Work Verifications</h1>
          <p className="text-[#64748B] text-lg">Review final work photos and approve task completion.</p>
        </div>
        <button 
          onClick={fetchVerifications}
          className="p-3 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh verifications"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-[#0F9D8A]" : "text-[#64748B]"} />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-8">
        <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto flex-1 max-w-2xl">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4 pointer-events-none" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full pl-9 pr-10 py-2.5 text-sm font-bold text-[#0B1F3A] border-2 border-[#E2E8F0] rounded-xl focus:ring-[#0F9D8A] focus:border-[#0F9D8A] bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="PENDING">Status: Pending</option>
                <option value="APPROVED">Status: Approved</option>
                <option value="REJECTED">Status: Rejected</option>
                <option value="REVISION_REQUESTED">Status: Revision Requested</option>
                <option value="">Status: All</option>
              </select>
            </div>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] w-4 h-4 pointer-events-none" />
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="block w-full pl-9 pr-10 py-2.5 text-sm font-bold text-[#0B1F3A] border-2 border-[#E2E8F0] rounded-xl focus:ring-[#0F9D8A] focus:border-[#0F9D8A] bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="">Priority: All</option>
                <option value="LOW">Priority: Low</option>
                <option value="MEDIUM">Priority: Medium</option>
                <option value="HIGH">Priority: High</option>
                <option value="CRITICAL">Priority: Critical</option>
              </select>
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#64748B]" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2.5 border-2 border-[#E2E8F0] rounded-xl text-sm font-medium focus:ring-[#0B1F3A] focus:border-[#0B1F3A] bg-white transition-colors"
              readOnly
            />
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 flex items-center justify-between">
                <div className="space-y-3 w-1/3">
                  <div className="h-5 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="h-10 bg-slate-200 rounded-xl w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-amber-500 opacity-80" />
            </div>
            <p className="text-[#0B1F3A] font-black text-xl mb-2">No verifications found</p>
            <p className="text-[#64748B]">There are no {filters.status.toLowerCase()} verifications matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-[#64748B] uppercase tracking-wider">Issue Details</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-[#64748B] uppercase tracking-wider">Worker & Distance</th>
                  <th scope="col" className="px-8 py-5 text-left text-xs font-black text-[#64748B] uppercase tracking-wider">Status & Time</th>
                  <th scope="col" className="px-8 py-5 text-right text-xs font-black text-[#64748B] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E2E8F0]">
                {verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-[#0B1F3A] font-bold">
                             #{v.issueId || '?'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#0B1F3A] truncate max-w-[250px] mb-1">{v.issueTitle}</div>
                          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                            {v.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center text-sm font-bold text-[#0F172A] mb-1.5">
                          <User size={14} className="text-[#0F9D8A] mr-2" />
                          {v.workerName}
                        </div>
                        <div className="flex items-center text-xs font-bold text-[#64748B]">
                          <MapPin size={12} className={v.distanceKm > 1 ? 'text-red-500 mr-2' : 'text-[#64748B] mr-2'} />
                          {v.distanceKm !== null ? (
                            <span className={v.distanceKm > 1 ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : ''}>
                              {v.distanceKm != null ? Number(v.distanceKm).toFixed(2) : '--'} km from site
                            </span>
                          ) : (
                            'Distance Unknown'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-start space-y-2">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(v.status)}`}>
                          {getStatusLabel(v.status)}
                        </span>
                        <div className="flex items-center text-xs font-medium text-[#64748B]">
                          <Clock size={12} className="mr-1.5 opacity-70" />
                          {formatDistanceToNow(new Date(v.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-medium">
                      <Link 
                        to={`/manager/verifications/after/${v.id}`}
                        className={`inline-flex items-center justify-center px-5 py-2 border-2 text-sm font-bold rounded-xl transition-colors ${
                          v.status === 'PENDING'
                            ? 'border-transparent text-white bg-[#0B1F3A] hover:bg-[#12345B]'
                            : 'border-[#E2E8F0] text-[#0B1F3A] bg-white hover:border-[#0B1F3A]'
                        }`}
                      >
                        {v.status === 'PENDING' ? 'Review' : 'View'}
                        <ChevronRight size={16} className="ml-1" />
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

export default ManagerAfterWorkVerifications;
