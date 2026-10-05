import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MapPin, Search, Filter, ChevronRight, User, RefreshCw } from 'lucide-react';
import managerService from '../../services/managerService';
import { format } from 'date-fns';

const ManagerIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerService.getApprovedIssues();
      setIssues(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (priority) => {
    const colors = {
      'CRITICAL': 'text-[#DC2626] font-black bg-red-50 px-2 py-0.5 rounded border border-red-100',
      'HIGH': 'text-[#F59E0B] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100',
      'MEDIUM': 'text-[#3B82F6] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100',
      'LOW': 'text-[#16A34A] font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100'
    };
    return colors[priority] || 'text-[#64748B] font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] mb-2 tracking-tight">Approved Issues</h1>
          <p className="text-[#64748B] text-lg">Review approved civic issues and move them into field execution.</p>
        </div>
        <button 
          onClick={fetchIssues}
          className="p-3 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh issues"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-[#0F9D8A]" : "text-[#64748B]"} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center border border-red-100 shadow-sm">
          <AlertCircle className="mr-3 flex-shrink-0" size={24} />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={fetchIssues} className="text-red-700 font-bold hover:underline px-2">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#E2E8F0]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center animate-pulse">
                <div className="w-1/3 pr-4">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="w-1/3 px-4">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
                <div className="w-1/3 pl-4 flex justify-end">
                  <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-[#64748B] opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">No Approved Issues</h3>
            <p className="text-[#64748B] max-w-sm mx-auto">
              There are currently no issues waiting for worker assignment in the operational pipeline.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Issue Details</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Category & Priority</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-[#64748B] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E2E8F0]">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-full bg-[#0F9D8A]/10 flex items-center justify-center">
                            <AlertCircle size={20} className="text-[#0F9D8A]" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#0F172A] truncate max-w-[200px] lg:max-w-xs mb-1" title={issue.title}>
                            {issue.title}
                          </div>
                          <div className="text-xs font-medium text-[#64748B] flex items-center">
                            <User size={14} className="mr-1 opacity-70" />
                            {issue.reporter?.user?.name || 'Unknown Reporter'}
                            <span className="mx-2">•</span>
                            {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-[#0F172A]">
                        <MapPin size={16} className="text-[#0F9D8A] mr-2 flex-shrink-0" />
                        <span className="truncate max-w-[200px] lg:max-w-xs" title={issue.address || ''}>
                          {issue.address || 'Address not provided'}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] font-mono mt-1 ml-6">
                        {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col space-y-2 items-start">
                        <span className="px-2.5 py-1 inline-flex text-xs font-bold rounded-lg bg-slate-100 text-[#0F172A] border border-slate-200">
                          {issue.category?.name || 'Uncategorized'}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider ${getPriorityStyle(issue.priority)}`}>
                          {issue.priority || 'UNKNOWN'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/manager/issues/${issue.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 border-2 border-[#0B1F3A] text-sm font-bold rounded-xl text-white bg-[#0B1F3A] hover:bg-[#12345B] shadow-sm transition-colors group-hover:pr-3"
                      >
                        Review Issue
                        <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
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

export default ManagerIssues;
