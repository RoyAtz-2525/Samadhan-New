import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import managerService from '../../services/managerService';
import { 
  ArrowLeft, Star, MapPin, IndianRupee, Clock, CheckCircle, 
  TrendingUp, FileText, Send, User, AlertCircle, Plus, LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManagerWorkerDetails = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('performance');
  
  const [showAppraisalForm, setShowAppraisalForm] = useState(false);
  const [appraisalForm, setAppraisalForm] = useState({
    periodStart: '',
    periodEnd: '',
    overallRating: '',
    workQualityRating: '',
    timelinessRating: '',
    reliabilityRating: '',
    professionalismRating: '',
    communicationRating: '',
    strengths: '',
    areasForImprovement: '',
    managerComments: '',
    goalsAndRecommendations: ''
  });
  const [submittingAppraisal, setSubmittingAppraisal] = useState(false);
  const [appraisalError, setAppraisalError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [workerRes, perfRes, appRes] = await Promise.all([
        managerService.getWorkerDetails(id),
        managerService.getWorkerPerformance(id),
        managerService.getAppraisals(id)
      ]);
      setWorker(workerRes.data);
      setPerformance(perfRes.data);
      setAppraisals(appRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const handleAppraisalChange = (e) => {
    setAppraisalForm({ ...appraisalForm, [e.target.name]: e.target.value });
  };

  const handleCreateAppraisal = async (e) => {
    e.preventDefault();
    setSubmittingAppraisal(true);
    setAppraisalError(null);
    try {
      const payload = {
        periodStart: new Date(appraisalForm.periodStart).toISOString(),
        periodEnd: new Date(appraisalForm.periodEnd).toISOString(),
      };
      
      const optionalIntFields = ['overallRating', 'workQualityRating', 'timelinessRating', 'reliabilityRating', 'professionalismRating', 'communicationRating'];
      optionalIntFields.forEach(f => {
        if (appraisalForm[f]) payload[f] = parseInt(appraisalForm[f]);
      });

      const optionalStringFields = ['strengths', 'areasForImprovement', 'managerComments', 'goalsAndRecommendations'];
      optionalStringFields.forEach(f => {
        if (appraisalForm[f]) payload[f] = appraisalForm[f];
      });

      await managerService.createAppraisal(id, payload);
      setShowAppraisalForm(false);
      setAppraisalForm({
        periodStart: '', periodEnd: '', overallRating: '', workQualityRating: '', timelinessRating: '', reliabilityRating: '', professionalismRating: '', communicationRating: '', strengths: '', areasForImprovement: '', managerComments: '', goalsAndRecommendations: ''
      });
      fetchDetails();
      toast.success('Appraisal draft created successfully');
    } catch (err) {
      setAppraisalError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create appraisal');
      toast.error('Failed to create appraisal draft');
    } finally {
      setSubmittingAppraisal(false);
    }
  };

  const handleSubmitAppraisal = async (appraisalId) => {
    if (!window.confirm('Are you sure you want to SUBMIT this appraisal? It will become immutable and visible to the worker.')) return;
    
    try {
      await managerService.submitAppraisal(appraisalId);
      toast.success('Appraisal submitted successfully');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appraisal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0F9D8A] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-[#DC2626]" />
        </div>
        <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">Worker Not Found</h2>
        <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto">{error || "This worker profile could not be loaded."}</p>
        <Link to="/manager/workers" className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Directory
        </Link>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    const styles = {
      'AVAILABLE': 'bg-green-50 text-green-700 border-green-200',
      'ON_LEAVE': 'bg-amber-50 text-amber-700 border-amber-200',
      'BUSY': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <Link 
        to="/manager/workers" 
        className="group flex items-center text-[#64748B] hover:text-[#0B1F3A] mb-8 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] w-fit hover:border-[#0B1F3A]"
      >
        <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F9D8A]/5 rounded-bl-full -z-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0F9D8A] to-[#0B1F3A] flex items-center justify-center text-white font-black text-4xl border-4 border-white shadow-lg shrink-0">
            {worker.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight mb-1">{worker.user.name}</h1>
            <p className="text-[#64748B] text-lg font-medium mb-3">{worker.user.email} • {worker.user.phone}</p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${getStatusStyle(worker.status)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${worker.status === 'AVAILABLE' ? 'bg-green-500' : worker.status === 'BUSY' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                {worker.status.replace(/_/g, ' ')}
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Star size={12} className="fill-current" />
                {performance?.reviews?.averageRating ? parseFloat(performance.reviews.averageRating).toFixed(1) : 'N/A'} Rating
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 md:text-right shrink-0">
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 md:text-left">
             <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Experience</p>
             <p className="font-bold text-[#0F172A]">{worker.experienceYears} Years</p>
           </div>
           <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 md:text-left">
             <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Location</p>
             <p className="font-bold text-[#0F172A] truncate flex items-center">
                <MapPin size={12} className="mr-1 text-[#0F9D8A]" />
                {worker.currentLocation ? 'Active Tracking' : `${worker.latitude?.substring(0,6)}, ${worker.longitude?.substring(0,6)}`}
             </p>
           </div>
           <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 md:text-left">
             <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Registered Skills</p>
             <div className="flex flex-wrap gap-1">
               {worker.skills.map((skill, i) => (
                 <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-[#0F172A]">
                   {skill}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'performance' 
              ? 'bg-white text-[#0B1F3A] shadow-sm ring-1 ring-black/5' 
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
          }`}
        >
          <LayoutDashboard size={18} className="mr-2" />
          Operational Metrics
        </button>
        <button
          onClick={() => setActiveTab('appraisals')}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'appraisals' 
              ? 'bg-white text-[#0B1F3A] shadow-sm ring-1 ring-black/5' 
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50'
          }`}
        >
          <FileText size={18} className="mr-2" />
          Formal Appraisals
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'performance' && performance && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#0B1F3A]">Objective Performance Metrics</h2>
              <span className="text-sm font-semibold text-[#64748B] bg-slate-100 px-3 py-1 rounded-lg">System Generated</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-100 relative overflow-hidden group hover:border-indigo-300 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <Star className="text-indigo-500 mb-4 relative z-10" size={28} />
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 relative z-10">Citizen Rating</h3>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {performance.reviews.averageRating ? parseFloat(performance.reviews.averageRating).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-lg font-bold text-[#64748B]">/ 5.0</span>
                </div>
                <p className="text-sm font-semibold text-indigo-600 mt-3 relative z-10 bg-indigo-50 w-fit px-2 py-0.5 rounded-md">
                  Based on {performance.reviews.totalReviews} reviews
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-green-100 relative overflow-hidden group hover:border-green-300 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <IndianRupee className="text-green-500 mb-4 relative z-10" size={28} />
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 relative z-10">Total Earnings</h3>
                <div className="flex items-baseline relative z-10">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {performance.earnings.totalEarned}
                  </span>
                </div>
                <p className="text-sm font-semibold text-green-600 mt-3 relative z-10 bg-green-50 w-fit px-2 py-0.5 rounded-md">
                  From completed payouts
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-blue-100 relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <CheckCircle className="text-blue-500 mb-4 relative z-10" size={28} />
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 relative z-10">Work Quality</h3>
                <div className="flex items-baseline gap-1 relative z-10">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {performance.verification.totalAfterWork > 0 
                      ? Math.round((performance.verification.approved / performance.verification.totalAfterWork) * 100) 
                      : 0}
                  </span>
                  <span className="text-2xl font-black text-[#64748B]">%</span>
                </div>
                <p className="text-sm font-semibold text-blue-600 mt-3 relative z-10 bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                  Verification approval rate
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-orange-100 relative overflow-hidden group hover:border-orange-300 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform"></div>
                <Clock className="text-orange-500 mb-4 relative z-10" size={28} />
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 relative z-10">Avg Completion</h3>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-4xl font-black text-[#0F172A]">
                    {performance.assignments.averageCompletionTimeHours}
                  </span>
                  <span className="text-lg font-bold text-[#64748B]">hrs</span>
                </div>
                <p className="text-sm font-semibold text-orange-600 mt-3 relative z-10 bg-orange-50 w-fit px-2 py-0.5 rounded-md">
                  Per resolved assignment
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-8 mt-6">
              <h3 className="text-lg font-bold text-[#0B1F3A] mb-6 flex items-center gap-2">
                <TrendingUp className="text-[#0F9D8A]" size={20} /> Operational Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-3xl font-black text-[#0F172A] mb-1">{performance.assignments.totalCompleted}</p>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Completed</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-3xl font-black text-[#0F172A] mb-1">{performance.assignments.currentlyActive}</p>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Currently Active</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-3xl font-black text-[#0F172A] mb-1">{performance.verification.rejected}</p>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Rejected Work</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-3xl font-black text-[#0F172A] mb-1">
                      {performance.assignments.totalCompleted > 0 
                        ? Math.round((performance.verification.rejected / performance.assignments.totalCompleted) * 100) 
                        : 0}%
                    </p>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Rejection Rate</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appraisals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-black text-[#0B1F3A]">Manager Appraisals</h2>
              {!showAppraisalForm && (
                <button 
                  onClick={() => setShowAppraisalForm(true)}
                  className="bg-[#0F9D8A] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#0B7A6A] transition-colors flex items-center"
                >
                  <Plus size={18} className="mr-2" /> New Appraisal
                </button>
              )}
            </div>

            {showAppraisalForm && (
              <div className="bg-white border-2 border-[#0B1F3A] rounded-3xl p-8 shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#0B1F3A]"></div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-[#0B1F3A]">Draft New Appraisal</h3>
                  <button onClick={() => setShowAppraisalForm(false)} className="text-[#64748B] hover:text-[#0F172A] font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
                
                {appraisalError && (
                  <div className="mb-6 flex items-center bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                    <AlertCircle size={20} className="mr-2 shrink-0" />
                    <span className="font-medium">{appraisalError}</span>
                  </div>
                )}
                
                <form onSubmit={handleCreateAppraisal} className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center">
                      <Clock size={16} className="mr-2 text-[#0F9D8A]" /> Evaluation Period
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Period Start</label>
                        <input type="date" required name="periodStart" value={appraisalForm.periodStart} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Period End</label>
                        <input type="date" required name="periodEnd" value={appraisalForm.periodEnd} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center">
                      <Star size={16} className="mr-2 text-[#0F9D8A]" /> Performance Ratings (1-5)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { name: 'overallRating', label: 'Overall Rating' },
                        { name: 'workQualityRating', label: 'Work Quality' },
                        { name: 'timelinessRating', label: 'Timeliness' },
                        { name: 'reliabilityRating', label: 'Reliability' },
                        { name: 'professionalismRating', label: 'Professionalism' },
                        { name: 'communicationRating', label: 'Communication' }
                      ].map(field => (
                        <div key={field.name}>
                          <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                            {field.label}
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            max="5" 
                            name={field.name} 
                            value={appraisalForm[field.name]} 
                            onChange={handleAppraisalChange} 
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center">
                      <FileText size={16} className="mr-2 text-[#0F9D8A]" /> Qualitative Assessment
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Strengths</label>
                        <textarea name="strengths" rows="2" value={appraisalForm.strengths} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Areas For Improvement</label>
                        <textarea name="areasForImprovement" rows="2" value={appraisalForm.areasForImprovement} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Manager Comments</label>
                        <textarea name="managerComments" rows="2" value={appraisalForm.managerComments} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Goals & Recommendations</label>
                        <textarea name="goalsAndRecommendations" rows="2" value={appraisalForm.goalsAndRecommendations} onChange={handleAppraisalChange} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow resize-none"></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      disabled={submittingAppraisal} 
                      className="px-8 py-3.5 text-white font-bold bg-[#0B1F3A] rounded-xl shadow-sm hover:bg-[#12345B] disabled:opacity-50 transition-colors"
                    >
                      {submittingAppraisal ? 'Saving Draft...' : 'Save Appraisal Draft'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!showAppraisalForm && appraisals.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-16 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <FileText className="h-10 w-10 text-[#64748B] opacity-50" />
                 </div>
                 <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">No Appraisals Yet</h3>
                 <p className="text-[#64748B]">This worker has not received any formal appraisals.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {appraisals.map((appraisal) => (
                  <div key={appraisal.id} className="bg-white border border-[#E2E8F0] rounded-3xl shadow-sm overflow-hidden group hover:border-[#0B1F3A] transition-colors">
                    <div className="bg-slate-50 px-8 py-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-[#0B1F3A]">
                            {new Date(appraisal.periodStart).toLocaleDateString()} — {new Date(appraisal.periodEnd).toLocaleDateString()}
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            appraisal.status === 'DRAFT' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            appraisal.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {appraisal.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Created {new Date(appraisal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {appraisal.status === 'DRAFT' && (
                        <button 
                          onClick={() => handleSubmitAppraisal(appraisal.id)}
                          className="flex items-center bg-[#0B1F3A] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#12345B] transition-colors w-fit"
                        >
                          <Send size={16} className="mr-2" /> Submit Final
                        </button>
                      )}
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        {[
                          { label: 'OVERALL', value: appraisal.overallRating, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                          { label: 'QUALITY', value: appraisal.workQualityRating },
                          { label: 'TIME', value: appraisal.timelinessRating },
                          { label: 'RELIABLE', value: appraisal.reliabilityRating },
                          { label: 'PRO', value: appraisal.professionalismRating },
                          { label: 'COMM', value: appraisal.communicationRating }
                        ].map((metric, idx) => (
                          <div key={idx} className={`${metric.bg || 'bg-slate-50'} ${metric.border || 'border-slate-100'} border p-3 rounded-2xl flex flex-col items-center justify-center`}>
                            <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{metric.label}</div>
                            <div className={`text-2xl font-black ${metric.color || 'text-[#0F172A]'}`}>{metric.value || '-'}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appraisal.strengths && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200">
                            <h4 className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider mb-2">Strengths</h4>
                            <p className="text-sm font-medium text-[#334155]">{appraisal.strengths}</p>
                          </div>
                        )}
                        {appraisal.areasForImprovement && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200">
                            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Areas For Improvement</h4>
                            <p className="text-sm font-medium text-[#334155]">{appraisal.areasForImprovement}</p>
                          </div>
                        )}
                        {appraisal.managerComments && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-2">
                            <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">Manager Comments</h4>
                            <p className="text-sm font-medium text-[#334155] whitespace-pre-wrap">{appraisal.managerComments}</p>
                          </div>
                        )}
                        {appraisal.goalsAndRecommendations && (
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-2">
                            <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">Goals & Recommendations</h4>
                            <p className="text-sm font-medium text-[#334155] whitespace-pre-wrap">{appraisal.goalsAndRecommendations}</p>
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
    </div>
  );
};

export default ManagerWorkerDetails;
