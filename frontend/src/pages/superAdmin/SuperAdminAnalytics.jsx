import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Clock, Filter, AlertCircle } from 'lucide-react';

const COLORS = ['#0B1F3A', '#0F9D8A', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#F43F5E'];

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAnalytics(dateRange);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3A] mx-auto mb-4"></div>
          <p className="text-[#64748B] font-medium">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-[#64748B] mt-1">Platform-wide reporting and usage metrics</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-sm relative group">
          <Filter className="w-4 h-4 text-[#64748B] group-focus-within:text-[#0F9D8A] transition-colors" />
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#0F172A] outline-none cursor-pointer appearance-none pr-4"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Issues Reported</h3>
          <p className="text-4xl font-black text-[#0B1F3A]">{analytics.summary.totalIssues}</p>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-[#16A34A] font-bold bg-emerald-50 px-2 py-1 rounded-md">{analytics.summary.resolvedIssues} resolved</span>
            <span className="text-[#64748B] ml-2 font-medium">({analytics.summary.openIssues} open)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Work Assignments</h3>
          <p className="text-4xl font-black text-[#0B1F3A]">{analytics.summary.totalAssignments}</p>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-[#3B82F6] font-bold bg-blue-50 px-2 py-1 rounded-md">{analytics.summary.completedAssignments} completed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Completed Payments</h3>
          <p className="text-4xl font-black text-[#0B1F3A]">₹{analytics.summary.totalPaidAmount.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-sm text-[#64748B] font-medium">
            Across {analytics.summary.completedPayments} transactions
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Issue Trend</h3>
          {analytics.issueTrend.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.issueTrend}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B1F3A" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#0B1F3A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="reported" stroke="#0B1F3A" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                  <Area type="monotone" dataKey="resolved" stroke="#0F9D8A" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#64748B] italic">No data available for this period</div>
          )}
        </div>

        {/* Issue Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Issue Status</h3>
          {analytics.issueStatusDistribution.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.issueStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {analytics.issueStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#64748B] italic">No data available for this period</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trend */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Payment Volume</h3>
          {analytics.paymentTrend.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.paymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="period" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(value) => `₹${value}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="amount" fill="#0F9D8A" name="Amount (₹)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[#64748B] italic">No data available for this period</div>
          )}
        </div>

        {/* User Role Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Platform Users</h3>
          <div className="flex flex-col sm:flex-row flex-grow items-center justify-center">
            <div className="w-full sm:w-1/2 h-[200px] sm:h-full min-h-[200px]">
              {analytics.userRoleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.userRoleDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="role"
                    >
                      {analytics.userRoleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#64748B] italic">No data available</div>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-center px-4 mt-6 sm:mt-0 space-y-6 border-t sm:border-t-0 sm:border-l border-[#E2E8F0] pt-6 sm:pt-0 sm:pl-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-[#3B82F6] rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Avg. Resolution</p>
                  <p className="text-2xl font-black text-[#0F172A] mt-1">
                    {analytics.resolutionMetrics.averageResolutionHours !== null 
                      ? `${analytics.resolutionMetrics.averageResolutionHours}h` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-[#0F9D8A] rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Issues Resolved</p>
                  <p className="text-2xl font-black text-[#0F172A] mt-1">
                    {analytics.resolutionMetrics.resolvedCount} <span className="text-sm font-medium text-[#64748B] normal-case">in period</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Categories */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Categories</h3>
          {analytics.issueCategoryDistribution.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.issueCategoryDistribution} layout="vertical" margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{fontSize: 11, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" width={80} tick={{fontSize: 11, fill: '#0F172A', fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#64748B] italic">No data available</div>
          )}
        </div>

        {/* Issue Priority */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Priority</h3>
          {analytics.issuePriorityDistribution.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.issuePriorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="priority" tick={{fontSize: 12, fill: '#64748B', fontWeight: 600}} tickLine={false} axisLine={{stroke: '#E2E8F0'}} />
                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#64748B] italic">No data available</div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6">Verifications</h3>
          {analytics.verificationDistribution.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.verificationDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="status" tick={{fontSize: 11, fill: '#64748B', fontWeight: 600}} tickLine={false} axisLine={{stroke: '#E2E8F0'}} />
                  <YAxis tick={{fontSize: 11, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#0B1F3A" name="Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#64748B] italic">No data available</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminAnalytics;
