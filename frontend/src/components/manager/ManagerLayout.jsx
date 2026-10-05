import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, Briefcase, Users, CheckSquare, ShieldCheck, Menu, X, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManagerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/manager', icon: LayoutDashboard },
    { name: 'Issues', path: '/manager/issues', icon: AlertCircle },
    { name: 'Assignments', path: '/manager/assignments', icon: Briefcase },
    { name: 'Workers', path: '/manager/workers', icon: Users },
    { name: 'Before-Work Ver.', path: '/manager/verifications/before', icon: CheckSquare },
    { name: 'After-Work Ver.', path: '/manager/verifications/after', icon: ShieldCheck }
  ];

  const isActiveRoute = (path) => {
    if (path === '/manager') {
      return location.pathname === '/manager';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0B1F3A] text-white p-4 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Samadhan Logo" className="h-8 brightness-0 invert" />
          <span className="font-bold text-sm tracking-wider uppercase">Manager</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-[#0B1F3A] text-white min-h-screen flex-shrink-0 flex flex-col z-20 absolute md:relative shadow-xl md:shadow-none`}> 
        <div className="hidden md:flex flex-col p-6 items-start border-b border-[#12345B]">
          <img src="/logo.png" alt="Samadhan Logo" className="h-10 brightness-0 invert mb-1" />
          <span className="text-xs font-semibold tracking-wider text-[#0F9D8A] uppercase ml-1">Manager Portal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveRoute(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#12345B] text-white font-medium border-l-4 border-[#3B82F6]' 
                    : 'text-slate-300 hover:bg-[#12345B] hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} className={isActive ? 'text-[#3B82F6]' : ''} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
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
                placeholder="Search issues, workers, assignments..."
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Notification */}
            <button className="relative p-2 text-[#64748B] hover:text-[#0F172A] bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none rounded-full pr-2 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F9D8A] to-[#0B1F3A] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                  {user?.name?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-[#0F172A] leading-tight">{user?.name || 'Manager'}</span>
                  <span className="text-xs text-[#64748B] font-medium">Manager</span>
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

export default ManagerLayout;
