import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapboxMap from '../../components/maps/MapboxMap';
import { getAdminIssueDetails, reviewIssue, updateIssuePriority } from '../../services/adminService';
import { format } from 'date-fns';
import { AlertCircle, MapPin, CheckCircle, XCircle, ArrowLeft, Image as ImageIcon, Video, Clock, Flag, Search, User, Info, FileText } from 'lucide-react';

const AdminIssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const data = await getAdminIssueDetails(id);
      setIssue(data);
    } catch (err) {
      setError('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (action === 'REJECT' && !rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (action === 'REJECT' && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }

    if (action === 'APPROVE' || action === 'UNDER_REVIEW') {
      if (!window.confirm(`Are you sure you want to change status to ${action.replace('_', ' ')}?`)) {
        return;
      }
    }

    setActionLoading(true);
    try {
      await reviewIssue(id, action, action === 'REJECT' ? rejectReason : 'Admin review action');
      await fetchIssueDetails(); // refresh
      setShowRejectInput(false);
      setRejectReason('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    if (!window.confirm(`Change priority to ${newPriority}?`)) return;
    
    setActionLoading(true);
    try {
      await updateIssuePriority(id, newPriority);
      await fetchIssueDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setActionLoading(false);
    }
  };

  const openMedia = (url) => {
    window.open(url, '_blank');
  };

  const getStatusStyle = (status) => {
    const styles = {
      REPORTED: 'bg-blue-50 text-blue-700 border-blue-200',
      UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      WORK_STARTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      UNDER_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
      WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      REPORTED: 'Reported',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      ASSIGNED: 'Assigned',
      WORK_STARTED: 'In Progress',
      UNDER_VERIFICATION: 'Under Verification',
      WORK_COMPLETED: 'Work Completed',
      RESOLVED: 'Resolved'
    };
    return labels[status] || status?.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0B1F3A] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-[#DC2626]" />
        </div>
        <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">Issue Not Found</h2>
        <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto">{error || 'The issue you are looking for does not exist or you do not have permission to view it.'}</p>
        <button 
          onClick={() => navigate('/admin/issues')} 
          className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Issues
        </button>
      </div>
    );
  }

  const images = issue.media?.filter(m => m.mediaType === 'IMAGE') || [];
  const videos = issue.media?.filter(m => m.mediaType === 'VIDEO') || [];
  const canReview = issue.status === 'REPORTED' || issue.status === 'UNDER_REVIEW';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/admin/issues')} 
        className="group flex items-center text-[#64748B] hover:text-[#0B1F3A] mb-8 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] w-fit hover:border-[#0B1F3A]"
      >
        <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to Issues
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Issue Header Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-[#0F9D8A]/10 text-[#0F9D8A]">
                    {issue.category?.name}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#64748B] bg-slate-100 px-3 py-1.5 rounded-lg">
                    ID: {issue.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1.5 inline-flex text-sm font-bold rounded-lg border ${getStatusStyle(issue.status)}`}>
                    {getStatusLabel(issue.status)}
                  </span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] mb-6 leading-tight">
                {issue.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-[#64748B] mb-8 font-medium">
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-[#0F9D8A]" />
                  Reported {format(new Date(issue.createdAt), 'MMMM d, yyyy \at h:mm a')}
                </div>
                {issue.reporter?.user && (
                  <div className="flex items-center">
                    <User size={18} className="mr-2 text-[#0F9D8A]" />
                    By {issue.reporter.user.name}
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
                
                {issue.latitude && issue.longitude && (
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-6">
                    <MapboxMap
                      center={[issue.longitude, issue.latitude]}
                      zoom={15}
                      markers={[{
                        id: issue.id || issue._id || '1',
                        longitude: issue.longitude,
                        latitude: issue.latitude,
                        color: issue.status === 'RESOLVED' ? '#10b981' : issue.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b',
                        popupHTML: "<div class='font-sans font-bold p-1'>" + issue.title + "</div>"
                      }]}
                      height="350px"
                    />
                  </div>
                )}
                
                <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                  <p className="text-[#0F172A] font-medium text-lg mb-4">
                    {issue.address || 'Address not provided'}
                  </p>
                  {issue.latitude && issue.longitude && (
                    <div className="flex items-center gap-2 text-sm font-mono bg-slate-100 p-3 rounded-lg w-fit text-[#64748B]">
                      <MapPin size={16} />
                      {issue.latitude?.toFixed(5)}, {issue.longitude?.toFixed(5)}
                    </div>
                  )}
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
                <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4 flex items-center gap-2">
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
                <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4 flex items-center gap-2">
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
                <p className="text-sm text-[#64748B]">This issue was reported without photos or videos.</p>
              </div>
            )}
          </div>
          
          {/* Status History Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden p-8">
            <h3 className="text-xl font-bold text-[#0B1F3A] mb-8">Status History</h3>
            
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-[#E2E8F0]" />
              <ul className="space-y-8 relative">
                {issue.statusHistory?.map((history, index) => {
                  const isLast = index === issue.statusHistory.length - 1;
                  const isReject = history.newStatus === 'REJECTED';
                  
                  let dotColor = "bg-slate-200 border-slate-300";
                  if (history.newStatus === 'REPORTED') dotColor = "bg-blue-100 border-blue-300 text-blue-600";
                  else if (history.newStatus === 'UNDER_REVIEW') dotColor = "bg-amber-100 border-amber-300 text-amber-600";
                  else if (history.newStatus === 'APPROVED') dotColor = "bg-teal-100 border-teal-300 text-teal-600";
                  else if (history.newStatus === 'REJECTED') dotColor = "bg-red-100 border-red-300 text-red-600";
                  else if (['ASSIGNED', 'WORK_STARTED', 'UNDER_VERIFICATION'].includes(history.newStatus)) dotColor = "bg-purple-100 border-purple-300 text-purple-600";
                  else if (history.newStatus === 'RESOLVED') dotColor = "bg-green-100 border-green-300 text-green-600";

                  return (
                    <li key={history.id} className="relative pl-12">
                      <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${dotColor}`}>
                        {isReject ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </div>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold text-[#0B1F3A]">
                              Status changed to <span className="uppercase tracking-wider">{getStatusLabel(history.newStatus)}</span>
                            </p>
                            {history.changedBy && (
                              <p className="text-sm text-[#64748B] font-medium mt-1">
                                by {history.changedBy.name} <span className="opacity-75">({history.changedBy.roles?.[0]?.role?.name})</span>
                              </p>
                            )}
                          </div>
                          <div className="text-sm font-bold text-[#64748B] whitespace-nowrap bg-white px-3 py-1 rounded-lg border border-slate-200 w-fit">
                            {format(new Date(history.createdAt || history.timestamp), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        
                        {history.reason && (
                          <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 text-[#334155] text-sm">
                            <span className="font-bold block mb-1">Reason:</span>
                            "{history.reason}"
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          
          {/* Admin Decision Panel */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-[#0B1F3A] overflow-hidden sticky top-8">
            <div className="bg-[#0B1F3A] px-6 py-5">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Flag size={20} className="text-[#0F9D8A]" /> Admin Decision Panel
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Responsibility Notice */}
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex items-start gap-3">
                <Info className="flex-shrink-0 mt-0.5" size={18} />
                <p>Worker assignment and execution are handled by the Manager after approval.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={issue.priority}
                    onChange={handlePriorityChange}
                    disabled={actionLoading}
                    className="w-full bg-slate-50 border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#0B1F3A]/10 focus:border-[#0B1F3A] font-bold cursor-pointer transition-all hover:border-slate-300 disabled:opacity-50"
                  >
                    <option value="LOW" className="font-bold text-green-600">LOW Priority</option>
                    <option value="MEDIUM" className="font-bold text-yellow-600">MEDIUM Priority</option>
                    <option value="HIGH" className="font-bold text-orange-600">HIGH Priority</option>
                    <option value="CRITICAL" className="font-bold text-red-600">CRITICAL Priority</option>
                  </select>
                </div>
              </div>

              <hr className="border-[#E2E8F0]" />

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                  Verification Actions
                </label>
                
                {canReview ? (
                  <div className="space-y-3">
                    {issue.status === 'REPORTED' && (
                      <button
                        onClick={() => handleReview('UNDER_REVIEW')}
                        disabled={actionLoading}
                        className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-[#0B1F3A] bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-50 border border-amber-200"
                      >
                        Start Review
                      </button>
                    )}
                    
                    {issue.status === 'UNDER_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleReview('APPROVE')}
                          disabled={actionLoading}
                          className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#0F9D8A] hover:bg-[#0B7A6A] transition-colors shadow-sm disabled:opacity-50"
                        >
                          Approve Issue
                        </button>
                        
                        {!showRejectInput ? (
                          <button
                            onClick={() => setShowRejectInput(true)}
                            disabled={actionLoading}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-[#DC2626] bg-white border-2 border-[#DC2626] hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Reject Issue
                          </button>
                        ) : (
                          <div className="mt-4 p-5 border-2 border-red-200 bg-red-50 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-red-800">Reason for Rejection *</label>
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              rows={3}
                              className="w-full border-2 border-red-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                              placeholder="Please explain why this issue cannot be processed..."
                            />
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleReview('REJECT')}
                                disabled={actionLoading}
                                className="flex-1 bg-[#DC2626] text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setShowRejectInput(false);
                                  setRejectReason('');
                                }}
                                disabled={actionLoading}
                                className="flex-1 bg-white border-2 border-[#E2E8F0] text-[#64748B] py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-[#0F172A] disabled:opacity-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-[#0F9D8A] mb-2 opacity-50" />
                    <p className="text-sm font-bold text-[#0F172A] mb-1">Review Complete</p>
                    <p className="text-xs text-[#64748B]">Actions are only available for Reported or Under Review issues.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reporter Quick Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E2E8F0] bg-slate-50">
              <h3 className="text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <User size={18} className="text-[#0F9D8A]" /> Reporter Info
              </h3>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Name</p>
                <p className="text-base font-medium text-[#0F172A]">{issue.reporter?.user?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Email</p>
                <p className="text-base font-medium text-[#0F172A] break-all">{issue.reporter?.user?.email || 'N/A'}</p>
              </div>
              {issue.reporter?.user?.phone && (
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-base font-medium text-[#0F172A]">{issue.reporter?.user?.phone}</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminIssueDetails;
