import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import { MapPin, Calendar, IndianRupee, AlertCircle, FileText, CheckCircle2, XCircle, ArrowLeft, Image as ImageIcon, Camera, Play, ClipboardList, Briefcase, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';

const WorkerAssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignment = async () => {
    try {
      const response = await workerService.getAssignmentDetails(id);
      setAssignment(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const handleAccept = async () => {
    if (!window.confirm("You are accepting this assignment and will be responsible for proceeding with the assigned civic issue.")) {
      return;
    }
    
    try {
      setSubmitting(true);
      await workerService.respondToAssignment(id, 'ACCEPT');
      fetchAssignment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting this assignment.');
      return;
    }
    
    try {
      setSubmitting(true);
      await workerService.respondToAssignment(id, 'REJECT', rejectReason);
      setShowRejectModal(false);
      fetchAssignment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
      'ACCEPTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'IN_PROGRESS': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'COMPLETED': 'bg-teal-100 text-teal-800 border-teal-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  if (loading && !assignment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 h-64"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-48"></div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-red-700 mb-2">Error Loading Assignment</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchAssignment} className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 sm:pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/worker/assignments')}
          className="mr-4 p-2 bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-[#64748B]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Assignment Details</h1>
          <p className="text-[#64748B] text-sm">#{assignment.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dynamic Action Banner based on Status */}
      <div className="mb-6">
        {assignment.status === 'PENDING' && (
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-[#0F172A]">Action Required</h3>
              </div>
              <p className="text-[#64748B] text-sm">Review the details and respond to this assignment.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-white border-2 border-slate-200 text-[#0F172A] font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 text-sm"
              >
                {submitting ? 'Accepting...' : 'Accept Assignment'}
              </button>
            </div>
          </div>
        )}

        {assignment.status === 'ACCEPTED' && (
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold text-[#0F172A]">Next: Before-Work Verification</h3>
              </div>
              <p className="text-[#64748B] text-sm">You must verify the location before starting work.</p>
            </div>
            
            <div className="w-full sm:w-auto">
              {!assignment.beforeWorkVerification || assignment.beforeWorkVerification.length === 0 ? (
                <button
                  onClick={() => navigate(`/worker/assignments/${id}/before-verification`)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0F9D8A] text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-sm text-sm"
                >
                  Start Verification
                </button>
              ) : (
                <div className="w-full sm:w-auto">
                  {assignment.beforeWorkVerification[0].status === 'PENDING' && (
                    <span className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-700 font-semibold rounded-xl border border-amber-200 text-sm">
                      Awaiting Manager Approval
                    </span>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'REVISION_REQUESTED' && (
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 text-sm">
                        Revision Requested
                      </span>
                      <p className="text-xs text-red-600 italic">{assignment.beforeWorkVerification[0].notes}</p>
                    </div>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'REJECTED' && (
                    <span className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 text-sm">
                      Verification Rejected
                    </span>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'APPROVED' && (
                    <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-200 text-sm">
                      Verification Approved
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {assignment.status === 'IN_PROGRESS' && (
          <div className="bg-white border-2 border-cyan-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="relative flex h-3 w-3 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">Work In Progress</h3>
              </div>
              <p className="text-[#64748B] text-sm">Record your progress and complete the work.</p>
            </div>
            <button
              onClick={() => navigate(`/worker/assignments/${id}/work`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors shadow-sm text-sm"
            >
              Continue Work
            </button>
          </div>
        )}

        {assignment.status === 'COMPLETED' && (
          <div className="bg-white border-2 border-teal-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <h3 className="text-lg font-bold text-[#0F172A]">Work Completed</h3>
              </div>
              <p className="text-[#64748B] text-sm">Submit after-work verification.</p>
            </div>
            
            <div className="w-full sm:w-auto flex flex-col gap-2">
              {!assignment.afterWorkVerification || assignment.afterWorkVerification.length === 0 ? (
                <button
                  onClick={() => navigate(`/worker/assignments/${id}/after-verification`)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0F9D8A] text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-sm text-sm"
                >
                  Start After-Work Verification
                </button>
              ) : (
                <>
                  {assignment.afterWorkVerification[0].status === 'PENDING' && (
                    <span className="inline-flex items-center justify-center px-4 py-2 bg-amber-50 text-amber-700 font-semibold rounded-xl border border-amber-200 text-sm">
                      Awaiting Manager Approval
                    </span>
                  )}
                  {assignment.afterWorkVerification[0].status === 'REVISION_REQUESTED' && (
                    <button
                      onClick={() => navigate(`/worker/assignments/${id}/after-verification`)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm text-sm"
                    >
                      Resubmit Verification
                    </button>
                  )}
                  {assignment.afterWorkVerification[0].status === 'APPROVED' && (
                    <span className="inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-200 text-sm">
                      Work Approved and Closed!
                    </span>
                  )}
                </>
              )}
              <button
                onClick={() => navigate(`/worker/assignments/${id}/work`)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-[#0B1F3A] font-semibold border-2 border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors text-xs text-center"
              >
                View Work Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        
        {/* Assignment & Issue Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded border border-slate-200 mb-3">
                  {assignment.issue?.category?.name || 'Uncategorized'}
                </span>
                <h2 className="text-2xl font-bold text-[#0F172A] leading-tight mb-2">
                  {assignment.issue?.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                  <span className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getPriorityColor(assignment.issue?.priority)}`}>
                    {assignment.issue?.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F7FA] rounded-xl p-4 mb-6">
              <p className="text-[#334155] whitespace-pre-wrap text-sm leading-relaxed">
                {assignment.issue?.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-[#64748B] border border-[#E2E8F0]">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Location</h4>
                  <p className="text-sm font-medium text-[#0F172A]">{assignment.issue?.address || 'Address not provided'}</p>
                  <p className="text-xs text-[#64748B] font-mono mt-0.5">{assignment.issue?.latitude?.toFixed(4)}, {assignment.issue?.longitude?.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-[#64748B] border border-[#E2E8F0]">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Assigned Rate</h4>
                  <p className="text-sm font-bold text-[#0F9D8A]">₹{assignment.assignedRate?.toLocaleString() || '0'}</p>
                </div>
              </div>

              {assignment.manager && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-[#64748B] border border-[#E2E8F0]">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Assigned By Manager</h4>
                    <p className="text-sm font-medium text-[#0F172A]">{assignment.manager.user.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{assignment.manager.user.phone || assignment.manager.user.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            {assignment.notes && (
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Manager Notes</h4>
                <div className="p-4 bg-amber-50 rounded-xl text-amber-900 text-sm border border-amber-200">
                  {assignment.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Media */}
        {assignment.issue?.media && assignment.issue.media.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
            <h3 className="text-lg font-bold text-[#0F172A] mb-4">Original Issue Media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assignment.issue.media.map(item => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B] group-hover:bg-slate-200 transition-colors">
                      <Play className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Video</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => !submitting && setShowRejectModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-[#E2E8F0]">
              <form onSubmit={handleRejectSubmit}>
                <div className="bg-white px-6 pt-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#0F172A]">Reject Assignment</h3>
                    <button type="button" onClick={() => setShowRejectModal(false)} className="text-[#64748B] hover:bg-slate-100 p-2 rounded-full transition-colors">
                      <XCircle size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-[#64748B] mb-5">
                    Please provide a reason for rejecting this assignment. This information will be sent to your manager.
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-2">Reason <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows="4"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border-2 border-[#E2E8F0] rounded-xl p-3 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-slate-400"
                      placeholder="e.g., Currently overloaded, cannot reach location..."
                    ></textarea>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-[#E2E8F0] text-[#0F172A] font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !rejectReason.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerAssignmentDetails;
