import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard, category: 'PLATFORM' },
    { name: 'Users', href: '/super-admin/users', icon: Users, category: 'PLATFORM' },
    { name: 'Issues', href: '/super-admin/issues', icon: AlertCircle, category: 'PLATFORM' },
    { name: 'Assignments', href: '/super-admin/assignments', icon: Briefcase, category: 'PLATFORM' },
    { name: 'Verifications', href: '/super-admin/verifications', icon: CheckSquare, category: 'OPERATIONS' },
    { name: 'Payments', href: '/super-admin/payments', icon: CreditCard, category: 'OPERATIONS' },
    { name: 'Appraisals', href: '/super-admin/appraisals', icon: Briefcase, category: 'OPERATIONS' },
    { name: 'Analytics', href: '/super-admin/analytics', icon: PieChart, category: 'INSIGHTS' },
    { name: 'Notifications', href: '/super-admin/notifications', icon: Bell, category: 'INSIGHTS' },
    { name: 'Audit Logs', href: '/super-admin/audit-logs', icon: Activity, category: 'INSIGHTS' },
    { name: 'Settings', href: '/super-admin/settings', icon: Settings, category: 'INSIGHTS' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActiveRoute = (path) => {
    if (path === '/super-admin') {
      return location.pathname === '/super-admin';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavGroup = (category) => {
    return navigation
      .filter((item) => item.category === category)
      .map((item) => {
        const isActive = isActiveRoute(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
              isActive 
                ? 'bg-[#12345B] text-white font-medium border-l-4 border-[#3B82F6]' 
                : 'text-slate-300 hover:bg-[#12345B] hover:text-white'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Icon size={18} className={isActive ? 'text-[#3B82F6]' : ''} />
            <span>{item.name}</span>
          </Link>
        );
      });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0B1F3A] text-white p-4 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Samadhan Logo" className="h-8 brightness-0 invert" />
          <span className="font-bold text-sm tracking-wider uppercase">Super Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-[#12345B] transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-[#0B1F3A] text-white min-h-screen flex-shrink-0 flex flex-col z-20 absolute md:relative shadow-xl md:shadow-none`}>
        <div className="hidden md:flex flex-col p-6 items-start border-b border-[#12345B]">
          <img src="/logo.png" alt="Samadhan Logo" className="h-10 brightness-0 invert mb-1" />
          <span className="text-xs font-semibold tracking-wider text-[#0F9D8A] uppercase ml-1">Platform Control</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Platform</h3>
            <div className="space-y-1">
              {renderNavGroup('PLATFORM')}
            </div>
          </div>
          
          <div>
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Operations</h3>
            <div className="space-y-1">
              {renderNavGroup('OPERATIONS')}
            </div>
          </div>
          
          <div>
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Insights</h3>
            <div className="space-y-1">
              {renderNavGroup('INSIGHTS')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10 shadow-sm">
          
          {/* Search bar placeholder */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#64748B] group-focus-within:text-[#3B82F6] transition-colors" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-[#E2E8F0] rounded-full leading-5 bg-[#F5F7FA] placeholder-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] sm:text-sm transition-all duration-200"
                placeholder="Search users, issues, assignments..."
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Notification */}
            <button className="relative p-2 text-[#64748B] hover:text-[#0F172A] bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#0F9D8A] ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none rounded-full pr-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1F3A] to-[#1a365d] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                  SA
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-[#0F172A] leading-tight">{user?.name || 'Super Admin'}</span>
                  <span className="text-xs text-[#64748B] font-medium flex items-center">
                    <ShieldCheck size={10} className="mr-1" />
                    Platform Admin
                  </span>
                </div>
                <ChevronDown size={16} className="text-[#64748B] hidden md:block" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20 border border-[#E2E8F0]">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-[#DC2626] hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
