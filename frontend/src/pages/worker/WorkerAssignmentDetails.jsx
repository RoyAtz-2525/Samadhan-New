import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import { MapPin, Calendar, IndianRupee, AlertCircle, FileText, CheckCircle2, XCircle, ArrowLeft, Image as ImageIcon, Camera, Play, ClipboardList, Briefcase, ChevronRight, User } from 'lucide-react';
import MapboxMap from '../../components/maps/MapboxMap';
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
      'PENDING': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      'ACCEPTED': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      'IN_PROGRESS': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
      'COMPLETED': 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      'REJECTED': 'bg-red-500/10 text-red-700 border-red-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  if (loading && !assignment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 h-64"></div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-48"></div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Assignment</h2>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button onClick={fetchAssignment} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 sm:pb-24">
      {/* Header */}
      <div className="mb-8 flex items-center">
        <button 
          onClick={() => navigate('/worker/assignments')}
          className="mr-4 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignment Details</h1>
          <p className="text-slate-500 font-medium mt-1">#{assignment.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Dynamic Action Banner based on Status */}
      <div className="mb-8">
        {assignment.status === 'PENDING' && (
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-6 h-6 text-amber-500" strokeWidth={2.5} />
                <h3 className="text-xl font-extrabold text-slate-900">Action Required</h3>
              </div>
              <p className="text-slate-500 font-medium">Review the details and respond to this assignment.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {assignment.status === 'ACCEPTED' && (
          <div className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                <h3 className="text-xl font-extrabold text-slate-900">Next: Before-Work Verification</h3>
              </div>
              <p className="text-slate-500 font-medium">You must verify the location before starting work.</p>
            </div>
            
            <div className="w-full sm:w-auto">
              {!assignment.beforeWorkVerification || assignment.beforeWorkVerification.length === 0 ? (
                <button
                  onClick={() => navigate("/worker/assignments/" + id + "/before-verification")}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors shadow-sm"
                >
                  Start Verification
                </button>
              ) : (
                <div className="w-full sm:w-auto">
                  {assignment.beforeWorkVerification[0].status === 'PENDING' && (
                    <span className="inline-flex items-center px-4 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200">
                      Awaiting Manager Approval
                    </span>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'REVISION_REQUESTED' && (
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center px-4 py-2.5 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200">
                        Revision Requested
                      </span>
                      <p className="text-xs text-red-600 font-medium italic">{assignment.beforeWorkVerification[0].notes}</p>
                    </div>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'REJECTED' && (
                    <span className="inline-flex items-center px-4 py-2.5 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200">
                      Verification Rejected
                    </span>
                  )}
                  {assignment.beforeWorkVerification[0].status === 'APPROVED' && (
                    <span className="inline-flex items-center px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200">
                      Verification Approved
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {assignment.status === 'IN_PROGRESS' && (
          <div className="bg-white border border-cyan-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Work In Progress</h3>
              </div>
              <p className="text-slate-500 font-medium">Record your progress and complete the work.</p>
            </div>
            <button
              onClick={() => navigate("/worker/assignments/" + id + "/work")}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors shadow-sm"
            >
              Continue Work
            </button>
          </div>
        )}

        {assignment.status === 'COMPLETED' && (
          <div className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-6 h-6 text-teal-500" strokeWidth={2.5} />
                <h3 className="text-xl font-extrabold text-slate-900">Work Completed</h3>
              </div>
              <p className="text-slate-500 font-medium">Submit after-work verification.</p>
            </div>
            
            <div className="w-full sm:w-auto flex flex-col gap-3">
              {!assignment.afterWorkVerification || assignment.afterWorkVerification.length === 0 ? (
                <button
                  onClick={() => navigate("/worker/assignments/" + id + "/after-verification")}
                  className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Start After-Work Verification
                </button>
              ) : (
                <>
                  {assignment.afterWorkVerification[0].status === 'PENDING' && (
                    <span className="inline-flex items-center justify-center px-4 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200">
                      Awaiting Manager Approval
                    </span>
                  )}
                  {assignment.afterWorkVerification[0].status === 'REVISION_REQUESTED' && (
                    <button
                      onClick={() => navigate("/worker/assignments/" + id + "/after-verification")}
                      className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Resubmit Verification
                    </button>
                  )}
                  {assignment.afterWorkVerification[0].status === 'APPROVED' && (
                    <span className="inline-flex items-center justify-center px-4 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200">
                      Work Approved and Closed!
                    </span>
                  )}
                </>
              )}
              <button
                onClick={() => navigate("/worker/assignments/" + id + "/work")}
                className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center shadow-sm"
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 mb-4">
                  {assignment.issue?.category?.name || 'Uncategorized'}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4">
                  {assignment.issue?.title}
                </h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={"inline-flex px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg border " + getStatusColor(assignment.status)}>
                    {assignment.status}
                  </span>
                  <span className={"inline-flex px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg border " + getPriorityColor(assignment.issue?.priority)}>
                    {assignment.issue?.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
              <p className="text-slate-700 whitespace-pre-wrap text-sm font-medium leading-relaxed">
                {assignment.issue?.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-200">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</h4>
                  <p className="text-base font-bold text-slate-900">{assignment.issue?.address || 'Address not provided'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-1 font-medium">{assignment.issue?.latitude?.toFixed(4)}, {assignment.issue?.longitude?.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-200">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned Rate</h4>
                  <p className="text-base font-black text-teal-600">₹{assignment.assignedRate?.toLocaleString() || '0'}</p>
                </div>
              </div>

              {assignment.manager && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-200">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assigned By Manager</h4>
                    <p className="text-base font-bold text-slate-900">{assignment.manager.user.name}</p>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{assignment.manager.user.phone || assignment.manager.user.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            {assignment.notes && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Manager Notes</h4>
                <div className="p-5 bg-amber-50 rounded-2xl text-amber-900 text-sm font-medium border border-amber-200">
                  {assignment.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Media */}
        {assignment.issue?.media && assignment.issue.media.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Original Issue Media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assignment.issue.media.map(item => (
                <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                      <Play className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-bold">Video</span>
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
            <div className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" onClick={() => !submitting && setShowRejectModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200">
              <form onSubmit={handleRejectSubmit}>
                <div className="bg-white px-6 sm:px-8 pt-8 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-extrabold text-slate-900">Reject Assignment</h3>
                    <button type="button" onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                      <XCircle size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    Please provide a reason for rejecting this assignment. This information will be sent to your manager.
                  </p>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Reason <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows="4"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-slate-400 bg-slate-50"
                      placeholder="e.g., Currently overloaded, cannot reach location..."
                    ></textarea>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 sm:px-8 py-5 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !rejectReason.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
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