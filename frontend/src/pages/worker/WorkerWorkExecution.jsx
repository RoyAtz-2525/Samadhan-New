import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Clock, Camera, FileText, CheckCircle2, AlertTriangle, AlertCircle, X, Check, XCircle, File, Image as ImageIcon, Video, Briefcase, MapPin, IndianRupee, PlayCircle, Plus } from 'lucide-react';

const WorkerWorkExecution = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [progressNote, setProgressNote] = useState('');
  const [progressMedia, setProgressMedia] = useState([]);
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);

  const [completeNote, setCompleteNote] = useState('');
  const [completeMedia, setCompleteMedia] = useState([]);
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  const fetchAssignment = async () => {
    try {
      const response = await workerService.getWorkExecution(id);
      setAssignment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch work execution details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const handleProgressMediaChange = (e) => {
    if (e.target.files) {
      setProgressMedia(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleCompleteMediaChange = (e) => {
    if (e.target.files) {
      setCompleteMedia(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeProgressMedia = (index) => {
    setProgressMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeCompleteMedia = (index) => {
    setCompleteMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!progressNote.trim() && progressMedia.length === 0) {
      toast.error('Please provide a note or media to update progress.');
      return;
    }

    try {
      setIsSubmittingProgress(true);
      await workerService.submitWorkProgress(id, {
        note: progressNote,
        media: progressMedia
      });
      toast.success('Progress updated successfully!');
      setProgressNote('');
      setProgressMedia([]);
      const fileInput = document.getElementById('progress-media-input');
      if (fileInput) fileInput.value = '';
      fetchAssignment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit progress');
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (completeMedia.length === 0) {
      toast.error('Completion evidence (at least one file) is required.');
      return;
    }
    
    if (!window.confirm("Are you sure you want to mark this work as COMPLETED? You won't be able to submit further progress.")) {
      return;
    }

    try {
      setIsSubmittingComplete(true);
      await workerService.completeWork(id, {
        note: completeNote,
        media: completeMedia
      });
      toast.success('Work marked as completed successfully!');
      setCompleteNote('');
      setCompleteMedia([]);
      fetchAssignment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete work');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  if (loading && !assignment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl h-64 border border-slate-200"></div>
            <div className="bg-white rounded-2xl h-80 border border-slate-200"></div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl h-64 border border-slate-200"></div>
            <div className="bg-white rounded-2xl h-48 border border-slate-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl flex flex-col items-center text-center max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Execution Details</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(`/worker/assignments/${id}`)}
            className="px-6 py-3 bg-white border border-red-200 text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = assignment?.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto pb-12 sm:pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(`/worker/assignments/${id}`)}
          className="mr-4 p-2 bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-[#64748B]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Work Execution</h1>
          <p className="text-[#64748B] text-sm">Update progress and mark completion</p>
        </div>
      </div>

      {isCompleted && (
        <div className="mb-8 bg-green-50 border-2 border-green-200 p-6 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-full flex-shrink-0 mt-1">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-green-800 font-bold text-lg mb-1">Work Completed</h3>
            <p className="text-green-700 font-medium">Awaiting After-Work Verification by Manager</p>
            <p className="text-sm text-green-600 mt-2">
              You have successfully completed this assignment. You can still view your progress below, but no further updates can be made.
            </p>
          </div>
        </div>
      )}

      {assignment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Progress Timeline & Action */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="p-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0F172A]" />
                  <h3 className="text-lg font-bold text-[#0F172A]">Progress Timeline</h3>
                </div>
                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {assignment.progressRecords?.length || 0} Updates
                </span>
              </div>
              
              <div className="p-6">
                {!assignment.progressRecords || assignment.progressRecords.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Clock className="w-12 h-12 text-[#64748B] mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-[#0F172A] mb-1">No progress recorded yet</p>
                    <p className="text-sm text-[#64748B]">Submit your first progress update below when you start working.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 pb-4 space-y-8">
                    {/* Work Started Marker */}
                    <div className="relative">
                      <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">Work Started</p>
                        <p className="text-xs text-[#64748B] mt-0.5">Before-work verification approved.</p>
                      </div>
                    </div>

                    {assignment.progressRecords.map((record, recordIdx) => (
                      <div key={record.id} className="relative">
                        <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                          <Plus className="w-3 h-3 text-blue-600 font-bold" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wider">
                            {new Date(record.createdAt).toLocaleString()}
                          </p>
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            {record.note && (
                              <p className="text-sm text-[#334155] mb-3 whitespace-pre-wrap">{record.note}</p>
                            )}
                            
                            {record.media && record.media.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {record.media.map(m => (
                                  <div key={m.id} className="relative rounded-lg overflow-hidden bg-slate-200 aspect-square border border-slate-200 group">
                                    {m.resourceType === 'video' ? (
                                      <div className="w-full h-full relative">
                                        <video src={m.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                          <PlayCircle className="w-8 h-8 text-white opacity-80" />
                                        </div>
                                      </div>
                                    ) : (
                                      <img src={m.url} alt="Progress" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submissions Section (hidden if completed) */}
            {!isCompleted && (
              <>
                {/* Submit Progress */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                  <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="w-5 h-5 text-[#3B82F6]" />
                      <h3 className="text-lg font-bold text-[#0F172A]">Update Work Progress</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleProgressSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-[#0F172A] mb-2">Progress Note</label>
                        <textarea
                          rows="3"
                          className="w-full border-2 border-[#E2E8F0] rounded-xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] transition-all bg-white placeholder:text-slate-400"
                          placeholder="What have you done so far?"
                          value={progressNote}
                          onChange={(e) => setProgressNote(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-[#0F172A] mb-2">Attach Media (Images/Videos)</label>
                        <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                          <Camera className="mx-auto h-8 w-8 text-[#64748B] mb-2" />
                          <label className="cursor-pointer inline-flex px-4 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm rounded-lg hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors shadow-sm">
                            <span>Browse Files</span>
                            <input
                              type="file"
                              id="progress-media-input"
                              multiple
                              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm"
                              onChange={handleProgressMediaChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        
                        {progressMedia.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {progressMedia.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm">
                                <div className="flex items-center overflow-hidden">
                                  {file.type.includes('video') ? <Video size={16} className="text-blue-500 mr-2 flex-shrink-0" /> : <ImageIcon size={16} className="text-blue-500 mr-2 flex-shrink-0" />}
                                  <span className="truncate text-[#334155] font-medium">{file.name}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => removeProgressMedia(idx)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingProgress}
                        className="w-full bg-[#0B1F3A] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#12345B] focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center"
                      >
                        {isSubmittingProgress ? 'Uploading...' : 'Submit Progress Update'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Complete Work */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                  <div className="p-6 border-b border-[#E2E8F0] bg-green-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-[#0F9D8A]" />
                      <h3 className="text-lg font-bold text-[#0F172A]">Mark Work Completed</h3>
                    </div>
                    <p className="text-sm text-[#64748B]">Provide final evidence of resolution.</p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleCompleteSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-[#0F172A] mb-2">Completion Note</label>
                        <textarea
                          rows="2"
                          className="w-full border-2 border-[#E2E8F0] rounded-xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/10 focus:border-[#0F9D8A] transition-all bg-white placeholder:text-slate-400"
                          placeholder="Any final remarks about the completed work?"
                          value={completeNote}
                          onChange={(e) => setCompleteNote(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-[#0F172A] mb-2">
                          Completion Evidence <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                          <CheckCircle2 className="mx-auto h-8 w-8 text-[#0F9D8A] mb-2 opacity-50" />
                          <label className="cursor-pointer inline-flex px-4 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm rounded-lg hover:border-[#0F9D8A] hover:text-[#0F9D8A] transition-colors shadow-sm">
                            <span>Browse Final Files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm"
                              onChange={handleCompleteMediaChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-[#64748B] mt-2">At least 1 photo/video required</p>
                        </div>

                        {completeMedia.length === 0 && (
                          <p className="text-xs text-red-500 mt-2 font-medium">Please provide proof of completion.</p>
                        )}
                        {completeMedia.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {completeMedia.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm">
                                <div className="flex items-center overflow-hidden">
                                  {file.type.includes('video') ? <Video size={16} className="text-green-600 mr-2 flex-shrink-0" /> : <ImageIcon size={16} className="text-green-600 mr-2 flex-shrink-0" />}
                                  <span className="truncate text-[#334155] font-medium">{file.name}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => removeCompleteMedia(idx)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingComplete || completeMedia.length === 0}
                        className="w-full bg-[#0F9D8A] text-white py-4 px-4 rounded-xl font-bold text-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:opacity-50 transition-all shadow-md"
                      >
                        {isSubmittingComplete ? 'Submitting...' : 'Mark Work Completed'}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
                <h3 className="font-bold text-[#0F172A] flex items-center">
                  <Briefcase size={18} className="mr-2 text-[#64748B]" />
                  Issue Details
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Title</p>
                  <p className="text-[#0F172A] font-medium leading-snug">{assignment.issue?.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Category</p>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200">
                      {assignment.issue?.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Priority</p>
                    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${
                      assignment.issue?.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                      assignment.issue?.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {assignment.issue?.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Address</p>
                  <div className="flex items-start">
                    <MapPin size={16} className="text-[#64748B] mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-[#334155] text-sm leading-relaxed">{assignment.issue?.address}</p>
                  </div>
                </div>

                {assignment.issue?.description && (
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Description</p>
                    <p className="text-[#334155] text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">{assignment.issue?.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] bg-slate-50">
                <h3 className="font-bold text-[#0F172A] flex items-center">
                  <FileText size={18} className="mr-2 text-[#64748B]" />
                  Assignment Info
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Status</span>
                  <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {assignment.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Rate</span>
                  <span className="text-lg font-bold text-[#0F9D8A] flex items-center">
                    <IndianRupee size={16} className="mr-0.5" />
                    {assignment.assignedRate?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Assigned On</span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      )}
    </div>
  );
};

export default WorkerWorkExecution;
