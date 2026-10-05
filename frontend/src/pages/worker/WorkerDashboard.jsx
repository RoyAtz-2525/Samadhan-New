import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, FileCheck, IndianRupee, Star, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import workerService from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, perfRes, appRes] = await Promise.all([
        workerService.getDashboardMetrics(),
        workerService.getPerformance(),
        workerService.getAppraisals()
      ]);
      setMetrics(dashRes.data || { pending: 0, active: 0, accepted: 0, total: 0, rejected: 0 });
      setPerformance(perfRes.data || null);
      setAppraisals(appRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAcknowledge = async (appraisalId) => {
    if (!window.confirm('Are you sure you want to acknowledge this appraisal? This confirms you have reviewed it.')) return;
    try {
      await workerService.acknowledgeAppraisal(appraisalId);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge appraisal');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const completedWork = metrics ? (metrics.total - metrics.pending - metrics.active - metrics.accepted - metrics.rejected) : 0;
  const pendingAppraisals = appraisals.filter(a => a.status === 'SUBMITTED').length;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1a365d] rounded-3xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 right-32 w-48 h-48 bg-[#3B82F6] opacity-20 rounded-full translate-y-1/2 blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Good Morning, {user?.name?.split(' ')[0] || 'Worker'} 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Stay on top of your assignments and help make your community better. You have <span className="font-semibold text-white">{metrics.pending} pending</span> assignments today.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link 
              to="/worker/assignments?status=PENDING" 
              className="bg-[#3B82F6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm inline-flex items-center"
            >
              View New Assignments
              <ChevronRight size={18} className="ml-1" />
            </Link>
            {metrics.active > 0 && (
              <Link 
                to="/worker/assignments?status=IN_PROGRESS" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm inline-flex items-center"
              >
                Continue Work
                <ChevronRight size={18} className="ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E2E8F0]">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${activeTab === 'overview' ? 'border-[#3B82F6] text-[#0F172A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`${activeTab === 'performance' ? 'border-[#3B82F6] text-[#0F172A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors`}
          >
            My Performance
          </button>
          <button
            onClick={() => setActiveTab('appraisals')}
            className={`${activeTab === 'appraisals' ? 'border-[#3B82F6] text-[#0F172A]' : 'border-transparent text-[#64748B] hover:text-[#0F172A] hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center transition-colors`}
          >
            Formal Appraisals
            {pendingAppraisals > 0 && (
              <span className="ml-2 bg-[#DC2626] text-white py-0.5 px-2 rounded-full text-[10px] font-bold">
                {pendingAppraisals} NEW
              </span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-1">{metrics.pending}</h3>
                <p className="text-sm font-medium text-[#64748B]">Pending Tasks</p>
                <Link to="/worker/assignments?status=PENDING" className="absolute inset-0 z-20"><span className="sr-only">View Pending Tasks</span></Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-[#3B82F6] rounded-xl flex items-center justify-center">
                    <Briefcase size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-1">{metrics.active}</h3>
                <p className="text-sm font-medium text-[#64748B]">Active Work</p>
                <Link to="/worker/assignments?status=IN_PROGRESS" className="absolute inset-0 z-20"><span className="sr-only">View Active Work</span></Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-50 rounded-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                    <FileCheck size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-1">{metrics.accepted}</h3>
                <p className="text-sm font-medium text-[#64748B]">Accepted Assignments</p>
                <Link to="/worker/assignments?status=ACCEPTED" className="absolute inset-0 z-20"><span className="sr-only">View Accepted</span></Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-teal-50 rounded-full transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-teal-100 text-[#0F9D8A] rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-1">{completedWork}</h3>
                <p className="text-sm font-medium text-[#64748B]">Completed Work</p>
                <Link to="/worker/assignments?status=COMPLETED" className="absolute inset-0 z-20"><span className="sr-only">View Completed</span></Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Current Work Timeline</h2>
                  <p className="text-sm text-[#64748B] mt-1">Status of your active assignments</p>
                </div>
                <Link to="/worker/assignments" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563eb] flex items-center">
                  View All <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
              
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-[#64748B]" />
                </div>
                <h3 className="text-[#0F172A] font-semibold mb-1">Timeline Available in Assignments</h3>
                <p className="text-sm text-[#64748B] mb-4 max-w-sm">
                  Navigate to your assignments list to view the detailed progress, submit verifications, and execute work.
                </p>
                <Link to="/worker/assignments" className="bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 font-medium px-4 py-2 rounded-xl text-sm transition-colors shadow-sm">
                  Go to Assignments
                </Link>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <h2 className="text-lg font-bold text-[#0F172A] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/worker/assignments" className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-[#3B82F6] hover:bg-[#F5F7FA] transition-colors group">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 text-[#3B82F6] rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                        <Briefcase size={16} />
                      </div>
                      <span className="font-medium text-sm text-[#0F172A]">View Assignments</span>
                    </div>
                    <ChevronRight size={16} className="text-[#64748B]" />
                  </Link>
                  <button onClick={() => setActiveTab('performance')} className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-teal-500 hover:bg-[#F5F7FA] transition-colors group">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 text-[#0F9D8A] rounded-lg flex items-center justify-center mr-3 group-hover:bg-[#0F9D8A] group-hover:text-white transition-colors">
                        <Star size={16} />
                      </div>
                      <span className="font-medium text-sm text-[#0F172A]">View Performance</span>
                    </div>
                    <ChevronRight size={16} className="text-[#64748B]" />
                  </button>
                  <button onClick={() => setActiveTab('appraisals')} className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] hover:border-indigo-500 hover:bg-[#F5F7FA] transition-colors group">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileCheck size={16} />
                      </div>
                      <span className="font-medium text-sm text-[#0F172A]">Formal Appraisals</span>
                    </div>
                    {pendingAppraisals > 0 && <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">NEW</span>}
                    <ChevronRight size={16} className="text-[#64748B] ml-auto" />
                  </button>
                </div>
              </div>

              {/* Location Placeholder */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 overflow-hidden relative">
                <h2 className="text-lg font-bold text-[#0F172A] mb-4">Work Location</h2>
                <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl h-32 flex flex-col items-center justify-center text-center p-4">
                  <MapPin size={24} className="text-[#64748B] mb-2 opacity-50" />
                  <p className="text-xs text-[#64748B] font-medium">Mapbox Map Placeholder</p>
                  <p className="text-[10px] text-[#94A3B8] mt-1">Location services will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">My Performance</h2>
            <p className="text-sm text-[#64748B] mt-1">Your objective metrics tracked by the SAMADHAN system</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <Star size={20} className="fill-current" />
                  </div>
                  <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Citizen Rating</h3>
                </div>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-[#0F172A] tracking-tight">{performance.reviews.averageRating}</p>
                  <p className="text-sm text-[#64748B] mb-1 ml-1 font-medium">/ 5.0</p>
                </div>
                <p className="text-xs font-medium text-[#64748B] mt-2">Based on {performance.reviews.totalReviews} reviews</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <IndianRupee size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Total Earnings</h3>
                </div>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-green-600 tracking-tight">₹{performance.earnings.totalEarned.toLocaleString()}</p>
                </div>
                <p className="text-xs font-medium text-[#64748B] mt-2">Completed payments</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 text-[#3B82F6] rounded-lg">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Work Quality</h3>
                </div>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-[#0F172A] tracking-tight">
                    {performance.verification.totalAfterWork > 0 
                      ? Math.round((performance.verification.approved / performance.verification.totalAfterWork) * 100) 
                      : 0}%
                  </p>
                </div>
                <p className="text-xs font-medium text-[#64748B] mt-2">Verification approval rate</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Avg Time</h3>
                </div>
                <div className="flex items-end">
                  <p className="text-4xl font-bold text-[#0F172A] tracking-tight">{performance.assignments.averageCompletionTimeHours}</p>
                  <p className="text-sm text-[#64748B] mb-1 ml-1 font-medium">hrs</p>
                </div>
                <p className="text-xs font-medium text-[#64748B] mt-2">Average completion time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appraisals' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Formal Appraisals</h2>
            <p className="text-sm text-[#64748B] mt-1">Official evaluations from your managers</p>
          </div>
          
          {appraisals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-4">
                <FileCheck className="w-8 h-8 text-[#64748B]" />
              </div>
              <p className="text-[#0F172A] font-semibold text-lg">No appraisals available</p>
              <p className="text-[#64748B] text-sm mt-1">You have not received any formal appraisals yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {appraisals.map((appraisal) => (
                <div key={appraisal.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${appraisal.status === 'SUBMITTED' ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]/50' : 'border-[#E2E8F0]'}`}>
                  <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A]">
                        Period: {format(new Date(appraisal.periodStart), 'MMM d, yyyy')} - {format(new Date(appraisal.periodEnd), 'MMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-[#64748B] font-medium mt-1">Evaluated by: {appraisal.manager?.user?.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                        appraisal.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {appraisal.status === 'SUBMITTED' ? 'ACTION REQUIRED' : appraisal.status}
                      </span>
                      {appraisal.status === 'SUBMITTED' && (
                        <button 
                          onClick={() => handleAcknowledge(appraisal.id)}
                          className="text-sm bg-[#3B82F6] text-white px-4 py-2 rounded-xl hover:bg-[#2563eb] transition-colors font-semibold shadow-sm"
                        >
                          Acknowledge Receipt
                        </button>
                      )}
                      {appraisal.status === 'ACKNOWLEDGED' && (
                        <p className="text-xs font-medium text-[#64748B] flex items-center">
                          <CheckCircle size={12} className="mr-1 text-green-500" />
                          Acknowledged on {format(new Date(appraisal.acknowledgedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                      <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">OVERALL</div>
                        <div className="text-2xl font-bold text-[#3B82F6]">{appraisal.overallRating || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">QUALITY</div>
                        <div className="text-xl font-bold text-[#0F172A]">{appraisal.workQualityRating || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">TIME</div>
                        <div className="text-xl font-bold text-[#0F172A]">{appraisal.timelinessRating || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">RELIABLE</div>
                        <div className="text-xl font-bold text-[#0F172A]">{appraisal.reliabilityRating || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">PRO</div>
                        <div className="text-xl font-bold text-[#0F172A]">{appraisal.professionalismRating || '-'}</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] text-center">
                        <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">COMM</div>
                        <div className="text-xl font-bold text-[#0F172A]">{appraisal.communicationRating || '-'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {appraisal.strengths && (
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Strengths</h4>
                          <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 text-sm text-[#334155] leading-relaxed">
                            {appraisal.strengths}
                          </div>
                        </div>
                      )}
                      {appraisal.areasForImprovement && (
                        <div>
                          <h4 className="text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Areas For Improvement</h4>
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-sm text-[#334155] leading-relaxed">
                            {appraisal.areasForImprovement}
                          </div>
                        </div>
                      )}
                      {appraisal.managerComments && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Manager Comments</h4>
                          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-sm text-[#334155] leading-relaxed">
                            {appraisal.managerComments}
                          </div>
                        </div>
                      )}
                      {appraisal.goalsAndRecommendations && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Goals & Recommendations</h4>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-[#334155] leading-relaxed">
                            {appraisal.goalsAndRecommendations}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
