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
        <div className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-3xl flex items-center">
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
      <div className="bg-[#0B1F3A] rounded-3xl overflow-hidden relative shadow-2xl border border-[#1e293b]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaC0ydi0yMGgtMjB2LTJoMjB2LTIwaDJ2MjBoMjB2MmgtMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="px-8 md:px-12 py-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-blue-300 mb-6 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
              <span>Worker Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">{user?.name?.split(' ')[0] || 'Worker'}</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Stay on top of your assignments and help make your community better. You have <span className="font-bold text-white">{metrics.pending} pending</span> assignments today.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                to="/worker/assignments?status=PENDING" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg inline-flex items-center"
              >
                View New Assignments
                <ChevronRight size={18} className="ml-1" strokeWidth={2.5} />
              </Link>
              {metrics.active > 0 && (
                <Link 
                  to="/worker/assignments?status=IN_PROGRESS" 
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md inline-flex items-center backdrop-blur-sm"
                >
                  Continue Work
                  <ChevronRight size={18} className="ml-1" strokeWidth={2.5} />
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex p-6 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl">
            <Briefcase className="w-16 h-16 text-blue-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={"px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap " + (activeTab === 'overview' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50")}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={"px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap " + (activeTab === 'performance' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50")}
          >
            My Performance
          </button>
          <button
            onClick={() => setActiveTab('appraisals')}
            className={"px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap flex items-center " + (activeTab === 'appraisals' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50")}
          >
            Formal Appraisals
            {pendingAppraisals > 0 && (
              <span className="ml-2 bg-red-500 text-white py-0.5 px-2 rounded-lg text-[10px] font-black">
                {pendingAppraisals} NEW
              </span>
            )}
          </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/worker/assignments?status=PENDING" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 rounded-2xl border bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100 transition-colors duration-300">
                  <Clock size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{metrics?.pending || 0}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Work</p>
              </div>
            </Link>

            <Link to="/worker/assignments?status=IN_PROGRESS" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 rounded-2xl border bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100 transition-colors duration-300">
                  <Briefcase size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{metrics?.active || 0}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Work</p>
              </div>
            </Link>

            <Link to="/worker/assignments?status=ACCEPTED" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 rounded-2xl border bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100 transition-colors duration-300">
                  <FileCheck size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{metrics?.accepted || 0}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Accepted</p>
              </div>
            </Link>

            <Link to="/worker/assignments?status=COMPLETED" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3.5 rounded-2xl border bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100 transition-colors duration-300">
                  <CheckCircle size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{completedWork}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Current Work Timeline</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Status of your active assignments</p>
                </div>
                <Link to="/worker/assignments" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  View All <ChevronRight size={16} className="ml-1" strokeWidth={2.5} />
                </Link>
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-200">
                  <Briefcase className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-900 font-bold text-xl mb-2">Timeline Available in Assignments</h3>
                <p className="text-slate-500 font-medium mb-6 max-w-sm">
                  Navigate to your assignments list to view the detailed progress, submit verifications, and execute work.
                </p>
                <Link to="/worker/assignments" className="bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
                  Go to Assignments
                </Link>
              </div>
            </div>

            {/* Side Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-extrabold text-slate-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/worker/assignments" className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Briefcase size={20} />
                      </div>
                      <span className="font-bold text-slate-900">View Assignments</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={2.5} />
                  </Link>
                  <button onClick={() => setActiveTab('performance')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Star size={20} />
                      </div>
                      <span className="font-bold text-slate-900">View Performance</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-teal-500 transition-colors" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setActiveTab('appraisals')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileCheck size={20} />
                      </div>
                      <span className="font-bold text-slate-900">Formal Appraisals</span>
                    </div>
                    {pendingAppraisals > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg ml-2">NEW</span>}
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors ml-auto" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Location Placeholder */}
              <div className="bg-[#0B1F3A] rounded-3xl shadow-xl overflow-hidden flex flex-col relative border border-[#1e293b]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
                <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10">
                  <h2 className="text-lg font-extrabold text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-teal-400" strokeWidth={2.5} />
                    Work Location
                  </h2>
                </div>
                <div className="h-48 bg-slate-900/50 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm z-10 p-6 text-center">
                  <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-teal-400 border border-white/20 relative z-10 mx-auto mb-4">
                    <MapPin className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <p className="font-bold text-white mb-1">Location Services</p>
                  <p className="text-slate-400 font-medium text-sm">Mapbox Map Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">My Performance</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Your objective metrics tracked by the SAMADHAN system</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Star size={24} className="fill-current" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Citizen Rating</p>
                <div className="flex items-end">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{performance.reviews.averageRating}</p>
                  <p className="text-sm text-slate-500 mb-1 ml-1 font-bold">/ 5.0</p>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">Based on {performance.reviews.totalReviews} reviews</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <CheckCircle size={24} strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Completion Rate</p>
                <div className="flex items-end">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {performance.assignments.total > 0 
                      ? Math.round((performance.assignments.completed / performance.assignments.total) * 100) 
                      : 0}%
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">{performance.assignments.completed} of {performance.assignments.total} assignments</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <FileCheck size={24} strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Verifications</p>
                <div className="flex items-end">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {performance.verification.totalAfterWork > 0 
                      ? Math.round((performance.verification.approved / performance.verification.totalAfterWork) * 100) 
                      : 0}%
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">Verification approval rate</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                  <Clock size={24} strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Time</p>
                <div className="flex items-end">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{performance.assignments.averageCompletionTimeHours}</p>
                  <p className="text-sm text-slate-500 mb-1 ml-1 font-bold">hrs</p>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-2">Average completion time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appraisals' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Formal Appraisals</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Official evaluations from your managers</p>
          </div>
          
          {appraisals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-200">
                <FileCheck className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
              </div>
              <p className="text-slate-900 font-bold text-xl mb-2">No appraisals available</p>
              <p className="text-slate-500 font-medium">You have not received any formal appraisals yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {appraisals.map((appraisal) => (
                <div key={appraisal.id} className={"bg-white rounded-3xl border shadow-sm overflow-hidden " + (appraisal.status === 'SUBMITTED' ? "border-blue-300 ring-2 ring-blue-50" : "border-slate-200")}>
                  <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Period: {format(new Date(appraisal.periodStart), 'MMM d, yyyy')} - {format(new Date(appraisal.periodEnd), 'MMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Evaluated by: {appraisal.manager?.user?.name}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={"inline-flex px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3 border " + 
                        (appraisal.status === 'SUBMITTED' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200")
                      }>
                        {appraisal.status === 'SUBMITTED' ? 'ACTION REQUIRED' : appraisal.status}
                      </span>
                      {appraisal.status === 'SUBMITTED' && (
                        <button 
                          onClick={() => handleAcknowledge(appraisal.id)}
                          className="text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
                        >
                          Acknowledge Receipt
                        </button>
                      )}
                      {appraisal.status === 'ACKNOWLEDGED' && (
                        <p className="text-xs font-bold text-slate-500 flex items-center">
                          <CheckCircle size={14} className="mr-1.5 text-green-500" />
                          Acknowledged on {format(new Date(appraisal.acknowledgedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">OVERALL</div>
                        <div className="text-2xl font-black text-blue-600">{appraisal.overallRating || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">QUALITY</div>
                        <div className="text-xl font-bold text-slate-900">{appraisal.workQualityRating || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">TIME</div>
                        <div className="text-xl font-bold text-slate-900">{appraisal.timelinessRating || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">RELIABLE</div>
                        <div className="text-xl font-bold text-slate-900">{appraisal.reliabilityRating || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">PRO</div>
                        <div className="text-xl font-bold text-slate-900">{appraisal.professionalismRating || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">COMM</div>
                        <div className="text-xl font-bold text-slate-900">{appraisal.communicationRating || '-'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {appraisal.strengths && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Strengths</h4>
                          <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed">
                            {appraisal.strengths}
                          </div>
                        </div>
                      )}
                      {appraisal.areasForImprovement && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Areas For Improvement</h4>
                          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed">
                            {appraisal.areasForImprovement}
                          </div>
                        </div>
                      )}
                      {appraisal.managerComments && (
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Manager Comments</h4>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed">
                            {appraisal.managerComments}
                          </div>
                        </div>
                      )}
                      {appraisal.goalsAndRecommendations && (
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Goals & Recommendations</h4>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed">
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