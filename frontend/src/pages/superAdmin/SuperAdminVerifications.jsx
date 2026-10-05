import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { CheckSquare, AlertCircle, HardHat, Clock, FileCheck } from 'lucide-react';

const SuperAdminVerifications = () => {
  const [data, setData] = useState({ before: [], after: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('before');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getVerifications('all');
      setData({
        before: res.before || [],
        after: res.after || []
      });
      setError(null);
    } catch (err) {
      setError('Failed to load verifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
      case 'REJECTED': return 'bg-red-50 text-[#DC2626] border-red-200';
      case 'REVISION_REQUESTED': return 'bg-orange-50 text-[#F59E0B] border-orange-200';
      default: return 'bg-yellow-50 text-[#F59E0B] border-yellow-200';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const verificationsList = activeTab === 'before' ? data.before : data.after;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Verifications</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Platform-wide oversight of before-work and after-work verification operations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-1.5 flex flex-col sm:flex-row max-w-md">
        <button 
          onClick={() => setActiveTab('before')}
          className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'before' 
              ? 'bg-[#F5F7FA] text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0]' 
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50'
          }`}
        >
          Before-Work
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E2E8F0] text-[#64748B]">
            {data.before?.length || 0}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('after')}
          className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'after' 
              ? 'bg-[#F5F7FA] text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0]' 
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50'
          }`}
        >
          After-Work
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E2E8F0] text-[#64748B]">
            {data.after?.length || 0}
          </span>
        </button>
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
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading verifications...</p>
        </div>
      ) : verificationsList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No verifications found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            There are no {activeTab}-work verifications currently available in the system.
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
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {verificationsList.map(item => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[250px]" title={item.assignment?.issue?.title}>
                            {item.assignment?.issue?.title || 'Unknown Issue'}
                          </span>
                          <div className="flex items-center text-xs text-[#64748B] mt-1 font-mono">
                            <FileCheck size={12} className="mr-1" />
                            Assignment: {item.assignmentId.substring(0,8)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#0F172A]">
                          <HardHat size={14} className="mr-2 text-[#64748B]" />
                          <span className="truncate max-w-[200px]">{item.worker?.user?.email || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          {formatDateTime(item.timestamp)}
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
            {verificationsList.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight line-clamp-2">
                      {item.assignment?.issue?.title || 'Unknown Issue'}
                    </h3>
                    <p className="text-xs text-[#64748B] font-mono mt-1">Assignment: {item.assignmentId.substring(0,8)}</p>
                  </div>
                  <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="bg-[#F5F7FA] p-3 rounded-lg border border-[#E2E8F0]">
                  <div className="text-xs text-[#64748B] font-medium mb-1">Worker</div>
                  <div className="flex items-center text-sm text-[#0F172A] font-semibold">
                    <HardHat size={14} className="mr-2 text-[#3B82F6]" />
                    <span className="truncate">{item.worker?.user?.email || 'Unknown'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#0F172A]">Submitted At:</span>
                  <div className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatDateTime(item.timestamp)}
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

export default SuperAdminVerifications;
