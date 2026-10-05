import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import superAdminService from '../../services/superAdmin/superAdminService';
import { Search, Filter, Eye, AlertCircle, FileText, Briefcase, Calendar, Star, ChevronLeft, ChevronRight, HardHat, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

const SuperAdminAppraisals = () => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  const [filters, setFilters] = useState({
    status: '',
    search: '', // workerId
    managerId: '',
    overallRating: '',
    startDate: '',
    endDate: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppraisals();
  }, [pagination.page, filters]);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.workerId = filters.search;
      if (filters.managerId) params.managerId = filters.managerId;
      if (filters.overallRating) params.overallRating = filters.overallRating;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await superAdminService.getAppraisals(params);
      setAppraisals(data.appraisals);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
      case 'SUBMITTED': return 'bg-yellow-50 text-[#F59E0B] border-yellow-200';
      case 'ACKNOWLEDGED': return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
      default: return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-[#64748B] text-xs font-semibold">N/A</span>;
    return (
      <div className="flex items-center">
        <Star size={14} className={`mr-1 ${rating >= 4 ? 'text-[#16A34A] fill-current' : rating >= 3 ? 'text-[#F59E0B] fill-current' : 'text-[#DC2626] fill-current'}`} />
        <span className={`font-bold text-sm ${rating >= 4 ? 'text-[#16A34A]' : rating >= 3 ? 'text-[#F59E0B]' : 'text-[#DC2626]'}`}>
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Appraisals</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Platform-wide worker appraisal oversight.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="relative group lg:col-span-1 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4 group-focus-within:text-[#3B82F6] transition-colors" />
            <input
              type="text"
              name="search"
              placeholder="Worker ID..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F5F7FA] focus:bg-white transition-all text-xs"
            />
          </div>

          <div className="relative group lg:col-span-1 xl:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4 group-focus-within:text-[#0F9D8A] transition-colors" />
            <input
              type="text"
              name="managerId"
              placeholder="Manager ID..."
              value={filters.managerId}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] bg-[#F5F7FA] focus:bg-white transition-all text-xs"
            />
          </div>
          
          <div className="relative group lg:col-span-1 xl:col-span-1">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-xs appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
          </div>

          <div className="relative group lg:col-span-1 xl:col-span-1">
            <select
              name="overallRating"
              value={filters.overallRating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-xs appearance-none"
            >
              <option value="">All Ratings</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
          </div>

          <div className="relative lg:col-span-1 xl:col-span-1">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-xs"
              title="Start Date"
            />
          </div>

          <div className="relative lg:col-span-1 xl:col-span-1">
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-xs"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1F3A]"></div>
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading appraisals...</p>
        </div>
      ) : appraisals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No appraisals found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            We couldn't find any appraisals matching your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Worker
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Manager
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E2E8F0]">
                {appraisals.map((appraisal) => (
                  <tr key={appraisal.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-[#0F172A]">
                        <Calendar size={14} className="mr-2 text-[#64748B]" />
                        {format(new Date(appraisal.periodStart), 'MMM yyyy')} - {format(new Date(appraisal.periodEnd), 'MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[#0F172A]">
                        <HardHat size={14} className="mr-2 text-[#3B82F6]" />
                        <span className="truncate max-w-[150px]">{appraisal.worker?.user?.email || 'Unknown Worker'}</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5 ml-5">
                        ID: {appraisal.workerId.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[#0F172A]">
                        <CheckSquare size={14} className="mr-2 text-[#0F9D8A]" />
                        <span className="truncate max-w-[150px]">{appraisal.manager?.user?.email || 'Unknown Manager'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(appraisal.overallRating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadgeColor(appraisal.status)}`}>
                        {appraisal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/super-admin/appraisals/${appraisal.id}`)}
                        className="text-[#3B82F6] hover:text-[#2563EB] bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4 bg-[#F5F7FA]">
            {appraisals.map((appraisal) => (
              <div key={appraisal.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center text-sm font-semibold text-[#0F172A]">
                    <Calendar size={14} className="mr-2 text-[#64748B]" />
                    {format(new Date(appraisal.periodStart), 'MMM yyyy')} - {format(new Date(appraisal.periodEnd), 'MMM yyyy')}
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border ${getStatusBadgeColor(appraisal.status)}`}>
                    {appraisal.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <div className="text-[#64748B] font-medium mb-1">Worker</div>
                    <div className="flex items-center text-[#0F172A] font-semibold">
                      <HardHat size={12} className="mr-1 text-[#3B82F6]" />
                      <span className="truncate">{appraisal.worker?.user?.email || 'Unknown'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[#64748B] font-medium mb-1">Manager</div>
                    <div className="flex items-center text-[#0F172A] font-semibold">
                      <CheckSquare size={12} className="mr-1 text-[#0F9D8A]" />
                      <span className="truncate">{appraisal.manager?.user?.email || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
                  <div>
                    {renderStars(appraisal.overallRating)}
                  </div>
                  <button
                    onClick={() => navigate(`/super-admin/appraisals/${appraisal.id}`)}
                    className="text-[#3B82F6] hover:text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between mt-auto">
              <div className="text-sm text-[#64748B]">
                Page <span className="font-bold text-[#0F172A]">{pagination.page}</span> of <span className="font-bold text-[#0F172A]">{pagination.totalPages}</span>
                <span className="hidden sm:inline"> (Total: {pagination.total})</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-[#E2E8F0] rounded-lg text-[#64748B] bg-white hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-[#E2E8F0] rounded-lg text-[#64748B] bg-white hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminAppraisals;
