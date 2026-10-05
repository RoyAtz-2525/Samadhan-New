import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'INFO':
      return <div className="p-2 bg-blue-50 text-[#3B82F6] rounded-xl"><Info className="h-5 w-5" /></div>;
    case 'ALERT':
      return <div className="p-2 bg-red-50 text-[#DC2626] rounded-xl"><AlertTriangle className="h-5 w-5" /></div>;
    case 'ASSIGNMENT':
      return <div className="p-2 bg-purple-50 text-[#8B5CF6] rounded-xl"><Briefcase className="h-5 w-5" /></div>;
    case 'PAYMENT':
      return <div className="p-2 bg-emerald-50 text-[#16A34A] rounded-xl"><CreditCard className="h-5 w-5" /></div>;
    case 'ISSUE_UPDATE':
      return <div className="p-2 bg-orange-50 text-[#F59E0B] rounded-xl"><FileText className="h-5 w-5" /></div>;
    default:
      return <div className="p-2 bg-gray-50 text-[#64748B] rounded-xl"><Bell className="h-5 w-5" /></div>;
  }
};

const SuperAdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    type: '',
    isRead: '',
    range: '30d',
    search: '',
    page: 1,
    limit: 20
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getNotifications(filters);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      setError('Failed to load platform notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value,
      page: 1 // Reset to page 1 on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center">
            <Bell className="mr-3 h-6 w-6 text-[#0F9D8A]" />
            Notifications Oversight
          </h1>
          <p className="text-sm text-[#64748B] mt-1 ml-9">
            Global oversight of all platform events, alerts, and system updates.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center">
          <div className="bg-[#F8FAFC] p-3 rounded-2xl mr-4 border border-[#E2E8F0]">
            <Bell className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total (Filtered)</p>
            <p className="text-2xl font-black text-[#0F172A] leading-tight mt-1">{pagination.total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4 group-focus-within:text-[#3B82F6] transition-colors" />
            <input 
              type="text" 
              name="search"
              placeholder="Search titles..." 
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F5F7FA] focus:bg-white transition-all text-sm"
            />
          </div>
          
          <div className="relative group">
            <select 
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none text-[#0F172A]"
            >
              <option value="">All Types</option>
              <option value="INFO">Info</option>
              <option value="ALERT">Alert</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="PAYMENT">Payment</option>
              <option value="ISSUE_UPDATE">Issue Update</option>
            </select>
          </div>
          
          <div className="relative group">
            <select 
              name="isRead"
              value={filters.isRead}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none text-[#0F172A]"
            >
              <option value="">All Statuses</option>
              <option value="false">Unread (by recipient)</option>
              <option value="true">Read (by recipient)</option>
            </select>
          </div>
          
          <div className="relative group">
            <select 
              name="range"
              value={filters.range}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0B1F3A]/20 focus:border-[#0B1F3A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none text-[#0F172A]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-sm border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col">
        {loading && notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1F3A] mb-4"></div>
            <p className="text-[#64748B] font-medium text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 inline-flex items-center mb-6">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {error}
            </div>
            <button 
              onClick={fetchNotifications}
              className="px-6 py-2.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-colors shadow-sm"
            >
              Retry Loading
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="bg-[#F8FAFC] rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 border border-[#E2E8F0]">
              <Bell className="h-10 w-10 text-[#94A3B8]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No notifications found</h3>
            <p className="text-[#64748B] text-sm">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ul className="divide-y divide-[#E2E8F0]">
              {notifications.map((notification) => (
                <li key={notification.id} className={`p-5 transition-colors ${!notification.isRead ? 'bg-[#F8FAFC]' : 'bg-white hover:bg-[#F8FAFC]'}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <p className={`text-sm font-bold ${!notification.isRead ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] font-medium sm:ml-4 whitespace-nowrap mt-1 sm:mt-0">
                          {new Date(notification.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-[#475569] leading-relaxed">{notification.message}</p>
                      
                      {/* Meta context block */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {notification.recipientRole && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] font-medium">
                            To: {notification.recipientRole}
                            {notification.recipientEmail && <span className="ml-1 opacity-70">({notification.recipientEmail})</span>}
                          </span>
                        )}
                        
                        {notification.issueId && (
                          <Link 
                            to={`/super-admin/issues/${notification.issueId}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[#3B82F6] bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 font-medium"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            Issue: {notification.issueTitle || notification.issueId.substring(0,8)}
                          </Link>
                        )}

                        {notification.assignmentId && (
                          <Link 
                            to="/super-admin/assignments"
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[#8B5CF6] bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200 font-medium"
                          >
                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                            Assignment Data
                          </Link>
                        )}
                        
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[#0F9D8A] bg-emerald-50 border border-emerald-200 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A] mr-2"></span>
                            Unread by recipient
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-[#E2E8F0] mt-auto">
                <div className="text-sm text-[#64748B]">
                  Showing <span className="font-bold text-[#0F172A]">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-[#0F172A]">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-[#0F172A]">{pagination.total}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-[#E2E8F0] rounded-lg text-[#64748B] bg-white hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
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
    </div>
  );
};

export default SuperAdminNotifications;
