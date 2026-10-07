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
      fetchAssignment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete work');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const isCompleted = assignment?.status === 'WORK_COMPLETED' || assignment?.status === 'COMPLETED';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/worker/assignments')}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 hover:text-[#0B1F3A] hover:border-[#0B1F3A] transition-all group"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">Work Execution</h1>
          <p className="text-slate-500 font-medium mt-1">Submit progress and completion for your assignment</p>
        </div>
      </div>

      {isCompleted && (
        <div className="mb-8 flex items-start gap-4 bg-green-50 border-2 border-green-200 rounded-3xl p-6 sm:p-8">
          <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-green-800 mb-1">Work Completed</h3>
            <p className="text-green-700 font-medium">Awaiting After-Work Verification by Manager</p>
            <p className="text-sm text-green-600 mt-2 font-medium">
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#0B1F3A]" strokeWidth={2.5} />
                  <h3 className="text-xl font-extrabold text-[#0B1F3A]">Progress Timeline</h3>
                </div>
                <span className="bg-[#0B1F3A]/5 text-[#0B1F3A] text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider border border-[#0B1F3A]/10">
                  {assignment.progressRecords?.length || 0} Updates
                </span>
              </div>
              <div className="p-6 sm:p-8">
                {!assignment.progressRecords || assignment.progressRecords.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-slate-400" strokeWidth={2} />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">No progress recorded yet</p>
                    <p className="text-sm text-slate-500 font-medium">Submit your first progress update below when you start working.</p>
                  </div>
                ) : (
                  <div className="relative border-l-[3px] border-slate-200 ml-4 pl-6 pb-4 space-y-10">
                    {/* Work Started Marker */}
                    <div className="relative">
                      <div className="absolute -left-[37px] top-0 h-8 w-8 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 text-blue-600 font-bold" strokeWidth={3} />
                      </div>
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 -mt-2">
                        <p className="text-base font-extrabold text-[#0B1F3A]">Work Started</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">Before-work verification approved.</p>
                      </div>
                    </div>

                    {assignment.progressRecords.map((record, recordIdx) => (
                      <div key={record.id} className="relative">
                        <div className="absolute -left-[37px] top-0 h-8 w-8 rounded-full bg-[#0F9D8A]/10 border-4 border-white flex items-center justify-center shadow-sm">
                          <Plus className="w-4 h-4 text-[#0F9D8A] font-bold" strokeWidth={3} />
                        </div>
                        <div className="-mt-1">
                          <p className="text-xs font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
                            {new Date(record.createdAt).toLocaleString()}
                          </p>
                          
                          <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm">
                            {record.note && (
                              <p className="text-[15px] text-slate-700 font-medium mb-4 whitespace-pre-wrap leading-relaxed">{record.note}</p>
                            )}
                            
                            {record.media && record.media.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {record.media.map(m => (
                                  <div key={m.id} className="relative rounded-xl overflow-hidden bg-slate-100 aspect-square border border-slate-200 group shadow-sm">
                                    {m.resourceType === 'video' ? (
                                      <div className="w-full h-full relative">
                                        <video src={m.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                                          <PlayCircle className="w-10 h-10 text-white opacity-90" />
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
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Camera className="w-6 h-6 text-[#3B82F6]" strokeWidth={2.5} />
                      <h3 className="text-xl font-extrabold text-[#0B1F3A]">Update Work Progress</h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <form onSubmit={handleProgressSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Progress Note</label>
                        <textarea
                          rows="3"
                          className="w-full border-2 border-slate-200 rounded-2xl p-4 text-[15px] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
                          placeholder="What have you done so far?"
                          value={progressNote}
                          onChange={(e) => setProgressNote(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Attach Media (Images/Videos)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-[#3B82F6]/50 transition-all group">
                          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3B82F6]/10 transition-colors">
                            <Camera className="w-7 h-7 text-slate-400 group-hover:text-[#3B82F6] transition-colors" />
                          </div>
                          <label className="cursor-pointer inline-flex px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all shadow-sm">
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
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {progressMedia.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                                <div className="flex items-center overflow-hidden">
                                  {file.type.includes('video') ? <Video size={18} className="text-[#3B82F6] mr-3 flex-shrink-0" /> : <ImageIcon size={18} className="text-[#3B82F6] mr-3 flex-shrink-0" />}
                                  <span className="truncate text-slate-700 font-bold">{file.name}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => removeProgressMedia(idx)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors ml-2"
                                >
                                  <X size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingProgress || (!progressNote.trim() && progressMedia.length === 0)}
                        className="w-full bg-[#3B82F6] text-white py-4 px-6 rounded-2xl font-bold text-[15px] hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {isSubmittingProgress ? (
                           <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Submitting...
                           </>
                        ) : 'Submit Progress Update'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Final Completion */}
                <div className="bg-white rounded-3xl shadow-sm border-2 border-teal-100 overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-teal-50 bg-teal-50/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#0F9D8A]" strokeWidth={2.5} />
                      <h3 className="text-xl font-extrabold text-teal-900">Final Completion</h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <form onSubmit={handleCompleteSubmit} className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div className="text-sm text-amber-800 font-medium leading-relaxed">
                          Marking the work as completed will <strong className="font-bold">lock</strong> this assignment. Ensure you have fully resolved the issue and uploaded final proof media before submitting.
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Completion Note (Optional)</label>
                        <textarea
                          rows="3"
                          className="w-full border-2 border-slate-200 rounded-2xl p-4 text-[15px] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400"
                          placeholder="Any final remarks about the completed work?"
                          value={completeNote}
                          onChange={(e) => setCompleteNote(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Final Proof (Required)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-[#0F9D8A]/50 transition-all group">
                          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0F9D8A]/10 transition-colors">
                            <CheckCircle2 className="w-7 h-7 text-slate-400 group-hover:text-[#0F9D8A] transition-colors" strokeWidth={2.5} />
                          </div>
                          <label className="cursor-pointer inline-flex px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-[#0F9D8A] hover:text-[#0F9D8A] transition-all shadow-sm">
                            <span>Browse Final Files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg, image/png, image/webp, video/mp4, video/webm"
                              onChange={handleCompleteMediaChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">At least 1 photo/video required</p>
                        </div>

                        {completeMedia.length === 0 && (
                          <p className="text-xs text-red-500 mt-3 font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Please provide proof of completion.
                          </p>
                        )}
                        {completeMedia.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {completeMedia.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm text-sm">
                                <div className="flex items-center overflow-hidden">
                                  {file.type.includes('video') ? <Video size={18} className="text-[#0F9D8A] mr-3 flex-shrink-0" /> : <ImageIcon size={18} className="text-[#0F9D8A] mr-3 flex-shrink-0" />}
                                  <span className="truncate text-slate-700 font-bold">{file.name}</span>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => removeCompleteMedia(idx)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors ml-2"
                                >
                                  <X size={16} strokeWidth={2.5} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isSubmittingComplete || completeMedia.length === 0}
                        className="w-full bg-[#0F9D8A] text-white py-4 px-6 rounded-2xl font-bold text-[15px] hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {isSubmittingComplete ? (
                           <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                             Submitting...
                           </>
                        ) : 'Mark Work Completed'}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-extrabold text-[#0B1F3A] flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
                  Issue Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Title</p>
                  <p className="text-base font-bold text-slate-900 leading-snug">{assignment.issue?.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Category</p>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                      {assignment.issue?.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Priority</p>
                    <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border ${
                      assignment.issue?.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' :
                      assignment.issue?.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {assignment.issue?.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Address</p>
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" strokeWidth={2.5} />
                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{assignment.issue?.address}</p>
                  </div>
                </div>

                {assignment.issue?.description && (
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-slate-600 text-sm font-medium bg-white p-4 rounded-2xl border border-slate-200 leading-relaxed shadow-sm">{assignment.issue?.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-extrabold text-[#0B1F3A] flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
                  Assignment Info
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</span>
                  <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    {assignment.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Rate</span>
                  <span className="text-xl font-black text-[#0F9D8A] flex items-center tracking-tight">
                    <IndianRupee className="w-5 h-5 mr-0.5" strokeWidth={3} />
                    {assignment.assignedRate?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Assigned On</span>
                  <span className="text-sm font-bold text-slate-900">
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
