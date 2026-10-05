import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Menu, X, User, LayoutDashboard, LogOut, ChevronDown, ClipboardList } from 'lucide-react';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch(user.role?.name) {
      case 'CITIZEN': return '/citizen/dashboard';
      case 'ADMIN': return '/admin';
      case 'MANAGER': return '/manager';
      case 'WORKER': return '/worker';
      case 'SUPER_ADMIN': return '/super-admin';
      default: return '/';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Civic Connect', path: '/civic-connect' }
  ];

  return (
    <nav className="bg-white shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Samadhan Logo" className="h-10" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth/User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">Login</Link>
                <Link to="/register" state={{ from: "/citizen/report-issue" }} className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Report an Issue
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
                >
                  <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                    <User size={18} />
                  </div>
                  <span className="text-sm font-medium">{user.name || 'Account'}</span>
                  <ChevronDown size={16} className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-1 uppercase">{user.role?.name}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to={getDashboardRoute()} 
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                        Dashboard
                      </Link>
                      
                      {user.role?.name === 'CITIZEN' && (
                        <Link 
                          to="/citizen/issues" 
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <ClipboardList className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          My Issues
                        </Link>
                      )}
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={handleLogout}
                        className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-red-500 group-hover:text-red-600" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {!user ? (
              <div className="space-y-1 px-4 flex flex-col gap-2">
                <Link 
                  to="/login" 
                  className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  state={{ from: "/citizen/report-issue" }}
                  className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Report an Issue
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center px-4 mb-3">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <User size={24} />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    <div className="text-xs font-semibold text-blue-600 uppercase">{user.role?.name}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link 
                    to={getDashboardRoute()} 
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
                      Dashboard
                    </div>
                  </Link>
                  {user.role?.name === 'CITIZEN' && (
                    <Link 
                      to="/citizen/issues" 
                      className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <ClipboardList className="mr-3 h-5 w-5 text-gray-400" />
                        My Issues
                      </div>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 mt-2"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-3 h-5 w-5 text-red-400" />
                      Logout
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
