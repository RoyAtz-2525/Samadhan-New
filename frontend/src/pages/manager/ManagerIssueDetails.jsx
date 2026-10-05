import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import managerService from '../../services/managerService';
import { format } from 'date-fns';
import { 
  AlertCircle, MapPin, ArrowLeft, Image as ImageIcon, Video, 
  Clock, User, FileText, Search, Settings, CheckCircle, IndianRupee, NotebookTabs 
} from 'lucide-react';

const ManagerIssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showWorkers, setShowWorkers] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  const [assignmentRate, setAssignmentRate] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const response = await managerService.getIssueDetails(id);
      setIssue(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleFindWorkers = async () => {
    try {
      setLoading(true);
      const response = await managerService.getWorkers(
        { status: 'AVAILABLE' }, 
        issue.latitude, 
        issue.longitude
      );
      setWorkers(response.data);
      setShowWorkers(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorker = (worker) => {
    setSelectedWorker(worker);
    setAssignmentRate(worker.hourlyRate || '');
  };

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !assignmentRate) return;
    
    try {
      setAssigning(true);
      await managerService.createAssignment({
        issueId: issue.id,
        workerId: selectedWorker.id,
        rate: parseFloat(assignmentRate),
        notes: assignmentNotes
      });
      alert('Worker assigned successfully');
      navigate('/manager/assignments');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign worker');
    } finally {
      setAssigning(false);
    }
  };

  const openMedia = (url) => {
    window.open(url, '_blank');
  };

  const getStatusStyle = (status) => {
    const styles = {
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      WORK_STARTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      UNDER_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
      WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-[#DC2626] font-black bg-red-50 px-2 py-0.5 rounded border border-red-100';
      case 'HIGH': return 'text-[#F59E0B] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100';
      case 'MEDIUM': return 'text-[#3B82F6] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100';
      case 'LOW': return 'text-[#16A34A] font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-100';
      default: return 'text-[#64748B] font-medium';
    }
  };

  if (loading && !issue) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0F9D8A] border-t-transparent"></div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-[#DC2626]" />
        </div>
        <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">Error Loading Issue</h2>
        <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto">{error}</p>
        <button 
          onClick={() => navigate('/manager/issues')} 
          className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Issues
        </button>
      </div>
    );
  }

  const images = issue?.media?.filter(m => m.mediaType === 'IMAGE') || [];
  const videos = issue?.media?.filter(m => m.mediaType === 'VIDEO') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/manager/issues')} 
        className="group flex items-center text-[#64748B] hover:text-[#0B1F3A] mb-8 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] w-fit hover:border-[#0B1F3A]"
      >
        <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to Approved Issues
      </button>

      {issue && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Issue Overview Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-[#0B1F3A] text-white">
                      {issue.category?.name}
                    </span>
                    <span className="text-sm font-mono font-bold text-[#64748B] bg-slate-100 px-3 py-1.5 rounded-lg">
                      ID: {issue.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1.5 inline-flex text-sm font-bold rounded-lg border ${getStatusStyle(issue.status)}`}>
                      {issue.status}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${getPriorityStyle(issue.priority)} inline-flex items-center`}>
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] mb-6 leading-tight">
                  {issue.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-[#64748B] mb-8 font-medium">
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-[#0F9D8A]" />
                    Approved {format(new Date(issue.createdAt), 'MMM d, yyyy \at h:mm a')}
                  </div>
                  {issue.reporter?.user && (
                    <div className="flex items-center">
                      <User size={18} className="mr-2 text-[#0F9D8A]" />
                      Reported by {issue.reporter.user.name}
                    </div>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-[#0F9D8A]" /> Description
                  </h3>
                  <p className="whitespace-pre-wrap leading-relaxed text-[#334155] text-lg bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {issue.description}
                  </p>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-t border-[#E2E8F0] p-8 bg-slate-50">
                <h3 className="text-xl font-bold text-[#0B1F3A] mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-[#0F9D8A]" /> Location Details
                </h3>
                
                <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <p className="text-[#0F172A] font-medium text-lg mb-4">
                    {issue.address || 'Address not provided'}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-mono bg-slate-100 p-3 rounded-lg w-fit text-[#64748B]">
                    <MapPin size={16} />
                    {issue.latitude?.toFixed(5)}, {issue.longitude?.toFixed(5)}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Gallery */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden p-8">
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-[#0F9D8A]" /> 
                Evidence ({issue.media?.length || 0})
              </h3>
              
              {images.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">
                    Images
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map(img => (
                      <div 
                        key={img.id} 
                        onClick={() => openMedia(img.url)}
                        className="relative group rounded-2xl overflow-hidden bg-slate-100 aspect-square cursor-pointer border-2 border-transparent hover:border-[#0F9D8A] transition-all shadow-sm"
                      >
                        <img src={img.url} alt="Evidence" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-[#0B1F3A]/0 group-hover:bg-[#0B1F3A]/40 transition-all flex items-center justify-center backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                          <Search className="text-white w-8 h-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">
                    Videos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map(vid => (
                      <div key={vid.id} className="rounded-2xl overflow-hidden border-2 border-[#E2E8F0] bg-black">
                        <video src={vid.url} controls className="w-full h-full aspect-video object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!issue.media || issue.media.length === 0) && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-[#E2E8F0]">
                  <ImageIcon className="mx-auto h-12 w-12 text-[#64748B] opacity-50 mb-4" />
                  <p className="text-[#0F172A] font-medium">No media evidence provided</p>
                </div>
              )}
            </div>
            
          </div>

          {/* Sidebar - Assignment Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border-2 border-[#0B1F3A] overflow-hidden sticky top-8">
              <div className="bg-[#0B1F3A] px-6 py-5">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Settings size={20} className="text-[#0F9D8A]" /> Assignment Panel
                </h3>
              </div>
              
              <div className="p-6">
                {!showWorkers && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-[#0F172A] mb-2">Worker Needed</h4>
                    <p className="text-sm text-[#64748B] mb-6">
                      This issue is approved and ready for field execution. Find and assign a nearby worker to resolve this issue.
                    </p>
                    <button
                      onClick={handleFindWorkers}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0F9D8A] hover:bg-[#0B7A6A] transition-colors shadow-sm"
                    >
                      <Search size={18} className="mr-2" /> Find Available Workers
                    </button>
                  </div>
                )}

                {showWorkers && !selectedWorker && (
                  <div className="animate-in fade-in">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-4">Available Workers</h3>
                    {workers.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                        <AlertCircle className="mx-auto h-8 w-8 text-[#64748B] mb-2 opacity-50" />
                        <p className="text-sm font-bold text-[#0F172A] mb-1">No Workers Found</p>
                        <p className="text-xs text-[#64748B]">There are no available workers nearby.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {workers.map(worker => (
                          <div key={worker.id} className="border-2 border-[#E2E8F0] rounded-2xl p-4 hover:border-[#0F9D8A] transition-colors cursor-pointer bg-white" onClick={() => handleSelectWorker(worker)}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-base font-bold text-[#0B1F3A]">{worker.user?.name || 'Unknown'}</h4>
                                <div className="text-xs text-[#64748B] font-medium flex gap-2 items-center mt-1">
                                  <span>Exp: {worker.experienceYears}y</span>
                                  <span>•</span>
                                  <span className="flex items-center"><IndianRupee size={12} className="mr-0.5" />{worker.hourlyRate}/hr</span>
                                </div>
                              </div>
                            </div>
                            
                            {worker.distanceKm !== null && (
                              <p className="text-xs font-bold text-[#0F9D8A] bg-[#0F9D8A]/10 px-2 py-1 rounded w-fit mb-3">
                                {worker.distanceKm} km away
                              </p>
                            )}

                            {worker.skills && worker.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {worker.skills.slice(0, 3).map(skill => (
                                  <span key={skill.id} className="inline-block bg-slate-100 rounded text-[10px] font-bold text-slate-700 px-2 py-0.5">
                                    {skill.skillName}
                                  </span>
                                ))}
                                {worker.skills.length > 3 && (
                                  <span className="inline-block bg-slate-100 rounded text-[10px] font-bold text-slate-700 px-2 py-0.5">
                                    +{worker.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectWorker(worker); }}
                              className="mt-4 w-full bg-slate-50 text-[#0B1F3A] border-2 border-[#E2E8F0] hover:bg-slate-100 hover:border-[#0B1F3A] px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            >
                              Select Worker
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedWorker && (
                  <div className="animate-in fade-in">
                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2">
                        <CheckCircle size={24} className="text-blue-500 opacity-20" />
                      </div>
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Selected Worker</h4>
                      <p className="text-lg font-black text-[#0B1F3A] mb-1">{selectedWorker.user?.name}</p>
                      {selectedWorker.distanceKm !== null && (
                        <p className="text-sm font-medium text-blue-700">{selectedWorker.distanceKm} km away</p>
                      )}
                    </div>

                    <form onSubmit={handleAssignWorker} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Agreed Rate (₹)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IndianRupee size={16} className="text-[#64748B]" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={assignmentRate}
                            onChange={(e) => setAssignmentRate(e.target.value)}
                            className="w-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#0B1F3A]/10 focus:border-[#0B1F3A] font-bold"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Notes (Optional)</label>
                        <textarea
                          rows="3"
                          value={assignmentNotes}
                          onChange={(e) => setAssignmentNotes(e.target.value)}
                          className="w-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-[#0B1F3A]/10 focus:border-[#0B1F3A] text-sm"
                          placeholder="Instructions for the worker..."
                        ></textarea>
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          type="submit"
                          disabled={assigning}
                          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0F9D8A] hover:bg-[#0B7A6A] transition-colors disabled:opacity-50"
                        >
                          {assigning ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWorker(null)}
                          className="w-full flex justify-center py-3.5 px-4 border-2 border-[#E2E8F0] rounded-xl text-sm font-bold text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] transition-colors"
                        >
                          Change Worker
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerIssueDetails;
