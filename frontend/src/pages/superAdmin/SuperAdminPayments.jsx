import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { CreditCard, Filter, Calendar, AlertCircle, HardHat, FileText, CheckCircle, Clock } from 'lucide-react';

const SuperAdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '' });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getPayments(filters);
      setPayments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load payments. Please try again.');
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
      case 'PROCESSING': return 'bg-blue-50 text-[#3B82F6] border-blue-200';
      case 'FAILED': return 'bg-red-50 text-[#DC2626] border-red-200';
      case 'REFUNDED': return 'bg-orange-50 text-[#F59E0B] border-orange-200';
      default: return 'bg-yellow-50 text-[#F59E0B] border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate totals from current dataset
  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const completedCount = payments.filter(p => p.status === 'COMPLETED').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Payments</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor worker payments and transaction status across the platform.
          </p>
        </div>
      </div>

      {/* KPI Cards (derived from current view) */}
      {!loading && !error && payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center text-[#64748B] mb-2">
              <CreditCard size={16} className="mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Value (View)</span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">₹{totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center text-[#64748B] mb-2">
              <FileText size={16} className="mr-2" />
              <span className="text-xs font-bold uppercase tracking-wider">Transactions</span>
            </div>
            <div className="text-2xl font-bold text-[#0F172A]">{payments.length}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center text-[#64748B] mb-2">
              <CheckCircle size={16} className="mr-2 text-[#16A34A]" />
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            </div>
            <div className="text-2xl font-bold text-[#16A34A]">{completedCount}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0]">
            <div className="flex items-center text-[#64748B] mb-2">
              <Clock size={16} className="mr-2 text-[#F59E0B]" />
              <span className="text-xs font-bold uppercase tracking-wider">Pending/Processing</span>
            </div>
            <div className="text-2xl font-bold text-[#F59E0B]">{pendingCount}</div>
          </div>
        </div>
      )}

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
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F9D8A]"></div>
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No payments found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            We couldn't find any payments matching your current filter criteria.
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
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Payment ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Issue</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Worker</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-mono text-[#0F172A] font-medium">
                            {payment.id.substring(0,8)}...
                          </span>
                          {payment.gatewayTransactionId && (
                            <span className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate max-w-[150px]" title={payment.gatewayTransactionId}>
                              Tx: {payment.gatewayTransactionId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#0F172A] truncate max-w-[200px]" title={payment.issue?.title}>
                          {payment.issue?.title || 'Unknown Issue'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#0F172A]">
                          <HardHat size={14} className="mr-2 text-[#64748B]" />
                          <span className="truncate max-w-[150px]">{payment.worker?.user?.email || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-[#0F172A]">
                          ₹{payment.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(payment.createdAt)}
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
            {payments.map(payment => (
              <div key={payment.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight line-clamp-2">
                      {payment.issue?.title || 'Unknown Issue'}
                    </h3>
                    <p className="text-xs text-[#64748B] font-mono mt-1">ID: {payment.id.substring(0,8)}</p>
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                <div className="bg-[#F5F7FA] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B] font-medium mb-1">Worker</div>
                  <div className="flex items-center text-sm text-[#0F172A] font-semibold">
                    <HardHat size={14} className="mr-2 text-[#3B82F6]" />
                    <span className="truncate">{payment.worker?.user?.email || 'Unknown'}</span>
                  </div>
                </div>

                {payment.gatewayTransactionId && (
                  <div className="text-xs text-[#64748B] font-mono">
                    <span className="font-semibold text-[#0F172A] mr-1">Tx:</span>
                    {payment.gatewayTransactionId}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center text-[#0F172A] font-bold text-base">
                    ₹{payment.amount}
                  </div>
                  <div className="flex items-center text-xs text-[#64748B]">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(payment.createdAt)}
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

export default SuperAdminPayments;
