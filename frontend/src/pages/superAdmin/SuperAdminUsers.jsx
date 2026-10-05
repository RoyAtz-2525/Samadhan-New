import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdmin/superAdminService';
import { Search, Filter, User, CheckCircle, XCircle, Users, Calendar, Shield, Phone, Mail } from 'lucide-react';

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ role: '', search: '' });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getUsers(filters);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getUserDisplayName = (user) => {
    if (user.citizenProfile?.firstName) return `${user.citizenProfile.firstName} ${user.citizenProfile.lastName || ''}`;
    if (user.workerProfile?.firstName) return `${user.workerProfile.firstName} ${user.workerProfile.lastName || ''}`;
    if (user.managerProfile?.firstName) return `${user.managerProfile.firstName} ${user.managerProfile.lastName || ''}`;
    if (user.adminProfile?.firstName) return `${user.adminProfile.firstName} ${user.adminProfile.lastName || ''}`;
    
    if (user.citizenProfile?.id) return 'Citizen Profile';
    if (user.workerProfile?.id) return 'Worker Profile';
    if (user.managerProfile?.id) return 'Manager Profile';
    if (user.adminProfile?.id) return 'Admin Profile';
    
    return 'No Profile';
  };

  const getRoleBadge = (roleName) => {
    switch (roleName?.toUpperCase()) {
      case 'CITIZEN': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'WORKER': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Users</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor registered users, roles, and account activity across SAMADHAN.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0]">
          <Users className="text-[#3B82F6]" size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Total Users</span>
            <span className="text-lg font-bold text-[#0F172A] leading-tight">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5 group-focus-within:text-[#3B82F6] transition-colors" />
            <input 
              type="text" 
              name="search"
              placeholder="Search by email or phone..." 
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F5F7FA] focus:bg-white transition-all text-sm"
            />
          </div>
          <div className="w-full sm:w-64 relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5 group-focus-within:text-[#0F9D8A] transition-colors" />
            <select 
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] bg-[#F5F7FA] focus:bg-white transition-all text-sm appearance-none"
            >
              <option value="">All Roles</option>
              <option value="CITIZEN">Citizen</option>
              <option value="WORKER">Worker</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center space-x-3">
          <XCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3B82F6]"></div>
          <p className="mt-4 text-[#64748B] font-medium text-sm">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-[#64748B]" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">No users found</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto">
            We couldn't find any users matching your current search and filter criteria.
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
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E2E8F0]">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#0B1F3A] to-[#1a365d] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                            {(getUserDisplayName(user).charAt(0)).toUpperCase() || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-[#0F172A]">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-xs text-[#64748B] font-mono mt-0.5">ID: {user.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-[#0F172A]">
                            <Mail size={14} className="mr-2 text-[#64748B]" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-[#64748B]">
                            <Phone size={14} className="mr-2 text-[#64748B]" />
                            {user.phone || 'Not provided'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getRoleBadge(user.role?.name)}`}>
                          <Shield size={12} className="mr-1 mt-0.5" />
                          {user.role?.name || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-[#16A34A] border border-green-200">
                            <CheckCircle className="mr-1 h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-[#DC2626] border border-red-200">
                            <XCircle className="mr-1 h-3.5 w-3.5" /> {user.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#64748B]">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(user.createdAt)}
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
            {users.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#0B1F3A] to-[#1a365d] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                      {(getUserDisplayName(user).charAt(0)).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-[#0F172A]">
                        {getUserDisplayName(user)}
                      </div>
                      <div className="text-xs text-[#64748B] font-mono mt-0.5">ID: {user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full border ${getRoleBadge(user.role?.name)}`}>
                      {user.role?.name || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center text-sm text-[#0F172A]">
                    <Mail size={14} className="mr-2 text-[#64748B]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-[#64748B]">
                    <Phone size={14} className="mr-2 text-[#64748B]" />
                    {user.phone || 'Not provided'}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E2E8F0]">
                  <div>
                    {user.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center text-xs font-bold text-[#16A34A]">
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-[#DC2626]">
                        <XCircle className="mr-1 h-3.5 w-3.5" /> {user.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-[#64748B]">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(user.createdAt)}
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

export default SuperAdminUsers;
