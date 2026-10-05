import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { Clock, Filter, AlertCircle, Shield, FileText, Search, User, Key } from 'lucide-react';

const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ entityType: '', action: '' });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAuditLogs(filters);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-50 text-[#3B82F6] border-blue-200';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-50 text-[#DC2626] border-red-200';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'bg-purple-50 text-[#8B5CF6] border-purple-200';
    return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center">
            <Shield className="w-6 h-6 mr-3 text-[#0F9D8A]" />
            Security & Audit Logs
          </h1>
          <p className="text-sm text-[#64748B] mt-1 ml-9">
            Immutable platform activity and security tracking.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64 relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4 group-focus-within:text-[#0F9D8A] transition-colors" />
            <select 
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none font-medium text-[#0F172A]"
            >
              <option value="">All Entities</option>
              <option value="Issue">Issue</option>
              <option value="User">User</option>
              <option value="WorkAssignment">Assignment</option>
              <option value="Payment">Payment</option>
              <option value="Verification">Verification</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          
          <div className="w-full md:w-80 relative group flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-4 w-4 group-focus-within:text-[#3B82F6] transition-colors" />
            <input 
              type="text" 
              name="action"
              placeholder="Filter by action (e.g. UPDATE_STATUS)" 
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F5F7FA] focus:bg-white transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col">
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Entity ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1F3A]"></div>
                        <p className="mt-4 text-[#64748B] font-medium text-sm">Loading audit logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-[#64748B]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#0F172A] mb-1">No logs found</h3>
                      <p className="text-[#64748B] text-sm">No audit logs match your filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#0F172A]">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-[#64748B] flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-[11px] font-bold tracking-wider rounded-md border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-[#64748B]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#0F172A]">{log.actor?.email || 'SYSTEM'}</div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-[#3B82F6]">{log.actor?.role?.name || 'Automated'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-[#475569] px-3 py-1 bg-[#F1F5F9] rounded-lg">
                          {log.entityType || 'Global'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-mono text-[#64748B]">
                          <Key className="w-3 h-3 mr-1.5 opacity-50" />
                          {log.entityId ? log.entityId.substring(0,8) + '...' : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4 bg-[#F5F7FA]">
            {loading ? (
               <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0B1F3A]"></div>
                 <p className="mt-4 text-[#64748B] font-medium text-sm">Loading logs...</p>
               </div>
            ) : logs.length === 0 ? (
               <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
                 <FileText className="h-8 w-8 text-[#64748B] mx-auto mb-3" />
                 <h3 className="text-base font-bold text-[#0F172A]">No logs found</h3>
               </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 inline-flex text-[10px] font-bold tracking-wider rounded-md border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#0F172A]">{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-[#64748B]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div>
                      <div className="text-[#64748B] font-medium mb-1">Actor</div>
                      <div className="font-semibold text-[#0F172A] truncate">{log.actor?.email || 'SYSTEM'}</div>
                      <div className="text-[10px] text-[#3B82F6] font-bold uppercase mt-0.5">{log.actor?.role?.name || 'Automated'}</div>
                    </div>
                    <div>
                      <div className="text-[#64748B] font-medium mb-1">Entity</div>
                      <div className="font-semibold text-[#475569]">{log.entityType || 'Global'}</div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate">{log.entityId ? log.entityId.substring(0,8) + '...' : 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAuditLogs;
