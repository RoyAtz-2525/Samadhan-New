import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { 
  Users, AlertTriangle, CheckCircle, Clock, 
  CreditCard, Activity, Briefcase, FileText,
  ChevronRight, ArrowUpRight, BarChart3, Database, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, link, subtitle }) => {
  // Extract background and text colors from the class string for the icon
  const bgMatch = colorClass.match(/bg-[a-z]+-100/);
  const textMatch = colorClass.match(/text-[a-z]+-600/);
  const bgColor = bgMatch ? bgMatch[0] : 'bg-slate-100';
  const textColor = textMatch ? textMatch[0] : 'text-slate-600';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E2E8F0] flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgColor} ${textColor}`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        {link && (
          <Link to={link} className="p-2 text-slate-400 hover:text-[#3B82F6] hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</p>
        <h3 className="text-sm font-semibold text-[#64748B] mt-1">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
      </div>
      
      {/* Decorative gradient blur */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${bgColor.replace('100', '400')} group-hover:opacity-20 transition-opacity`}></div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const overview = await superAdminService.getOverview();
        setData(overview);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-32 bg-slate-200 rounded-3xl animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-center shadow-sm max-w-7xl mx-auto">
      <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
      <p className="font-medium">{error}</p>
    </div>
  );

  if (!data) return (
    <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 max-w-7xl mx-auto">
      No data available
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      
      {/* Hero Banner */}
      <div className="relative bg-[#0B1F3A] rounded-3xl overflow-hidden shadow-lg border border-[#12345B]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/90 to-transparent z-10"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="relative z-20 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-white/90 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-sm">
              <Activity size={14} className="text-[#0F9D8A]" />
              <span>Platform Health: Optimal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Platform Overview</h1>
            <p className="text-slate-300 max-w-xl text-sm md:text-base">Complete control and visibility across the SAMADHAN civic ecosystem. Monitor real-time performance, operational bottlenecks, and financial flow.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/super-admin/settings" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors border border-white/10 flex items-center">
              <Settings size={16} className="mr-2" />
              Settings
            </Link>
            <Link to="/super-admin/analytics" className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors flex items-center shadow-md">
              <BarChart3 size={16} className="mr-2" />
              Full Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-[#3B82F6]" />
          Global Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={data.kpis.totalUsers?.toLocaleString() || 0} 
            icon={Users} 
            colorClass="bg-blue-100 text-blue-600"
            link="/super-admin/users"
            subtitle="Registered across all roles"
          />
          <StatCard 
            title="Open Issues" 
            value={data.kpis.openIssues?.toLocaleString() || 0} 
            icon={AlertTriangle} 
            colorClass="bg-amber-100 text-amber-600"
            link="/super-admin/issues"
            subtitle="Require immediate attention"
          />
          <StatCard 
            title="Resolved Issues" 
            value={data.kpis.resolvedIssues?.toLocaleString() || 0} 
            icon={CheckCircle} 
            colorClass="bg-green-100 text-green-600"
            link="/super-admin/issues"
            subtitle="Successfully closed"
          />
          <StatCard 
            title="Total Processed" 
            value={formatCurrency(data.kpis.totalPaymentValue || 0)} 
            icon={CreditCard} 
            colorClass="bg-teal-100 text-teal-600"
            link="/super-admin/payments"
            subtitle="Platform gross value"
          />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-[#8B5CF6]" />
          Operational Backlog
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="In Progress Issues" 
            value={data.kpis.inProgressIssues?.toLocaleString() || 0} 
            icon={Activity} 
            colorClass="bg-cyan-100 text-cyan-600"
            link="/super-admin/issues"
          />
          <StatCard 
            title="Pending Assignments" 
            value={data.kpis.pendingAssignments?.toLocaleString() || 0} 
            icon={Briefcase} 
            colorClass="bg-indigo-100 text-indigo-600"
            link="/super-admin/assignments"
          />
          <StatCard 
            title="Pending Verifications" 
            value={data.kpis.pendingVerifications?.toLocaleString() || 0} 
            icon={FileText} 
            colorClass="bg-orange-100 text-orange-600"
            link="/super-admin/verifications"
          />
          <StatCard 
            title="Completed Payments" 
            value={data.kpis.completedPayments?.toLocaleString() || 0} 
            icon={CreditCard} 
            colorClass="bg-blue-100 text-blue-600"
            link="/super-admin/payments"
          />
        </div>
      </div>

      {/* Complex Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Role Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden lg:col-span-1 flex flex-col">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
            <h3 className="font-bold text-[#0F172A]">Platform Demographics</h3>
            <Users size={18} className="text-[#64748B]" />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="space-y-6">
              {Object.entries(data.roleDistribution || {}).sort((a, b) => b[1] - a[1]).map(([role, count]) => {
                const percentage = Math.max(1, (count / (data.kpis.totalUsers || 1)) * 100);
                let colorClass = 'bg-blue-500';
                if (role === 'CITIZEN') colorClass = 'bg-[#3B82F6]';
                if (role === 'WORKER') colorClass = 'bg-[#F59E0B]';
                if (role === 'MANAGER') colorClass = 'bg-[#0F9D8A]';
                if (role === 'ADMIN') colorClass = 'bg-[#8B5CF6]';
                if (role === 'SUPER_ADMIN') colorClass = 'bg-[#DC2626]';

                return (
                  <div key={role} className="group">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-[#334155]">{role.replace('_', ' ')}</span>
                      <span className="font-bold text-[#0F172A]">{count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden">
                      <div className={`${colorClass} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-[#E2E8F0] bg-slate-50">
            <Link to="/super-admin/users" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563eb] flex items-center justify-center">
              Manage All Users <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
            <h3 className="font-bold text-[#0F172A]">Recent Audit Log Activity</h3>
            <Link to="/super-admin/audit-logs" className="text-xs font-bold text-[#3B82F6] hover:text-[#2563eb] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              View Full Logs
            </Link>
          </div>
          <div className="divide-y divide-[#E2E8F0] overflow-y-auto max-h-[400px]">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => {
                const isSystem = activity.actorRole === 'SYSTEM' || !activity.actorRole;
                const isError = activity.action?.toLowerCase().includes('fail') || activity.action?.toLowerCase().includes('error');
                
                return (
                  <div key={activity.id} className="p-5 hover:bg-[#F8FAFC] transition-colors flex items-start gap-4">
                    <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl ${
                      isError ? 'bg-red-100 text-red-600' : 
                      isSystem ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-[#3B82F6]'
                    }`}>
                      {isError ? <AlertTriangle size={18} /> : 
                       isSystem ? <Database size={18} /> : <ShieldCheck size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] break-words">{activity.action}</p>
                      <div className="flex flex-wrap items-center mt-2 gap-2">
                        <span className="text-xs font-medium text-[#64748B] flex items-center">
                          <Clock size={12} className="mr-1" />
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {activity.actorRole || 'SYSTEM'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
                          Entity: {activity.entityType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-[#0F172A] font-bold">No recent activity</p>
                <p className="text-sm text-[#64748B] mt-1">Audit logs are currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
