const fs = require('fs');
const path = require('path');

const superAdminDir = path.join(__dirname, 'src', 'pages', 'superAdmin');
const componentsDir = path.join(__dirname, 'src', 'components', 'superAdmin');
const servicesDir = path.join(__dirname, 'src', 'services', 'superAdmin');

[superAdminDir, componentsDir, servicesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. Service
const serviceContent = `import api from '../api';

const superAdminService = {
  getOverview: async () => {
    const response = await api.get('/super-admin/overview');
    return response.data;
  },
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/users?${params}`);
    return response.data;
  },
  getIssues: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/issues?${params}`);
    return response.data;
  },
  getIssueDetail: async (id) => {
    const response = await api.get(`/super-admin/issues/${id}`);
    return response.data;
  },
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/assignments?${params}`);
    return response.data;
  },
  getVerifications: async (type = 'all') => {
    const response = await api.get(`/super-admin/verifications?type=${type}`);
    return response.data;
  },
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/payments?${params}`);
    return response.data;
  },
  getAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/audit-logs?${params}`);
    return response.data;
  }
};

export default superAdminService;
`;

fs.writeFileSync(path.join(servicesDir, 'superAdminService.js'), serviceContent);

// 2. Layout
const layoutContent = `import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  Briefcase,
  CheckSquare,
  CreditCard,
  PieChart,
  Bell,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/super-admin', icon: LayoutDashboard },
    { name: 'Users', href: '/super-admin/users', icon: Users },
    { name: 'Issues', href: '/super-admin/issues', icon: AlertCircle },
    { name: 'Assignments', href: '/super-admin/assignments', icon: Briefcase },
    { name: 'Verifications', href: '/super-admin/verifications', icon: CheckSquare },
    { name: 'Payments', href: '/super-admin/payments', icon: CreditCard },
    { name: 'Analytics', href: '/super-admin/analytics', icon: PieChart },
    { name: 'Notifications', href: '/super-admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: Activity },
    { name: 'Settings', href: '/super-admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <div className="font-bold text-lg">SAMADHAN Control Center</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 text-white min-h-screen flex-shrink-0 flex flex-col`}> 
        <div className="hidden md:block p-6">
          <h1 className="text-xl font-bold tracking-wider">SAMADHAN</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Control Center</p>
        </div>

        <nav className="flex-1 mt-4 md:mt-0 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/super-admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${isActive ? 'bg-slate-800 text-white border-l-4 border-blue-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'} group flex items-center px-3 py-2.5 text-sm font-medium rounded-r-md transition-colors`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className={`${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'} mr-3 flex-shrink-0 h-5 w-5`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-slate-800 mt-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                SA
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name || 'Super Admin'}</p>
              <p className="text-xs font-medium text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
`;
fs.writeFileSync(path.join(componentsDir, 'SuperAdminLayout.jsx'), layoutContent);

// 3. Overview Dashboard
const dashboardContent = `import React, { useState, useEffect } from 'react';
import superAdminService from '../../../services/superAdmin/superAdminService';
import { 
  Users, AlertTriangle, CheckCircle, Clock, 
  CreditCard, Activity, Briefcase, FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, link }) => (
  <div className="bg-white rounded-lg shadow p-5 border border-gray-100 flex items-center">
    <div className={`p-3 rounded-full ${colorClass} mr-4`}>
      <Icon className="h-6 w-6" />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
    {link && (
      <Link to={link} className="text-gray-400 hover:text-blue-500">
        <span className="sr-only">View {title}</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

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

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500">SAMADHAN System Health and KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={data.kpis.totalUsers} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600"
          link="/super-admin/users"
        />
        <StatCard 
          title="Open Issues" 
          value={data.kpis.openIssues} 
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-600"
          link="/super-admin/issues?status=REPORTED"
        />
        <StatCard 
          title="In Progress" 
          value={data.kpis.inProgressIssues} 
          icon={Activity} 
          colorClass="bg-yellow-100 text-yellow-600"
          link="/super-admin/issues?status=WORK_STARTED"
        />
        <StatCard 
          title="Resolved Issues" 
          value={data.kpis.resolvedIssues} 
          icon={CheckCircle} 
          colorClass="bg-green-100 text-green-600"
          link="/super-admin/issues?status=RESOLVED"
        />
        <StatCard 
          title="Pending Verifications" 
          value={data.kpis.pendingVerifications} 
          icon={FileText} 
          colorClass="bg-purple-100 text-purple-600"
          link="/super-admin/verifications"
        />
        <StatCard 
          title="Pending Assignments" 
          value={data.kpis.pendingAssignments} 
          icon={Briefcase} 
          colorClass="bg-orange-100 text-orange-600"
          link="/super-admin/assignments"
        />
        <StatCard 
          title="Payments Value" 
          value={formatCurrency(data.kpis.totalPaymentValue)} 
          icon={CreditCard} 
          colorClass="bg-emerald-100 text-emerald-600"
          link="/super-admin/payments"
        />
        <StatCard 
          title="Completed Payments" 
          value={data.kpis.completedPayments} 
          icon={CreditCard} 
          colorClass="bg-teal-100 text-teal-600"
          link="/super-admin/payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Role Distribution */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(data.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-600">{role}</div>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.max(1, (count / data.kpis.totalUsers) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-gray-900 ml-4">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Platform Activity</h3>
            <Link to="/super-admin/audit-logs" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex">
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      <span>&bull;</span>
                      <span className="font-medium px-2 py-0.5 rounded bg-gray-100">{activity.actorRole}</span>
                      <span>&bull;</span>
                      <span className="font-mono">{activity.entityType}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">No recent activity found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
`;
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminDashboard.jsx'), dashboardContent);

const emptyPageTemplate = (name, title) => `import React from 'react';
const ${name} = () => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">${title}</h1>
    </div>
    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
      <p>This module is currently being implemented.</p>
    </div>
  </div>
);
export default ${name};
`;

fs.writeFileSync(path.join(superAdminDir, 'SuperAdminUsers.jsx'), emptyPageTemplate('SuperAdminUsers', 'User Management'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminIssues.jsx'), emptyPageTemplate('SuperAdminIssues', 'Platform Issues'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminAssignments.jsx'), emptyPageTemplate('SuperAdminAssignments', 'Assignments'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminVerifications.jsx'), emptyPageTemplate('SuperAdminVerifications', 'Verifications'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminPayments.jsx'), emptyPageTemplate('SuperAdminPayments', 'Payments'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminAnalytics.jsx'), emptyPageTemplate('SuperAdminAnalytics', 'Platform Analytics'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminNotifications.jsx'), emptyPageTemplate('SuperAdminNotifications', 'System Notifications'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminAuditLogs.jsx'), emptyPageTemplate('SuperAdminAuditLogs', 'Audit Logs'));
fs.writeFileSync(path.join(superAdminDir, 'SuperAdminSettings.jsx'), emptyPageTemplate('SuperAdminSettings', 'Platform Settings'));

console.log('Super Admin scaffolding created.');
