import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import managerService from '../../services/managerService';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, CheckSquare, AlertCircle, MapPin, Navigation, 
  Image as ImageIcon, CheckCircle, XCircle, RefreshCw, FileText, User
} from 'lucide-react';
import { format } from 'date-fns';

const BeforeWorkVerificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ show: false, action: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await managerService.getBeforeWorkVerificationDetails(id);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load verification details');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (action) => {
    setReviewModal({ show: true, action, reason: '' });
  };

  const submitReview = async () => {
    if ((reviewModal.action === 'REJECT' || reviewModal.action === 'REVISION_REQUESTED') && !reviewModal.reason.trim()) {
      toast.error('A reason is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        action: reviewModal.action,
      };
      
      if (reviewModal.reason.trim()) {
        payload.reason = reviewModal.reason.trim();
      }

      const response = await managerService.reviewBeforeWorkVerification(id, payload);
      if (response.success) {
        toast.success(response.message || `Verification ${reviewModal.action.toLowerCase().replace('_', ' ')} successfully`);
        setReviewModal({ show: false, action: '', reason: '' });
        fetchDetails(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.msg || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
      'APPROVED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200',
      'REVISION_REQUESTED': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const openMedia = (url) => window.open(url, '_blank');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0F9D8A] border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-12 w-12 text-[#DC2626]" />
        </div>
        <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">Verification Not Found</h2>
        <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto">This verification may have been removed or you do not have permission to view it.</p>
        <Link to="/manager/verifications/before" className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to List
        </Link>
      </div>
    );
  }

  const { issue, worker, verification, assignment } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <Link 
        to="/manager/verifications/before" 
        className="group flex items-center text-[#64748B] hover:text-[#0B1F3A] mb-8 transition-colors font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E2E8F0] w-fit hover:border-[#0B1F3A]"
      >
        <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to List
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight mb-2">Verification Details</h1>
          <p className="text-[#64748B] text-sm">Review worker arrival status, site condition, and evidence.</p>
        </div>
        <span className={`px-4 py-1.5 inline-flex text-sm font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(verification.status)}`}>
          {verification.status?.replace(/_/g, ' ') || 'UNKNOWN'}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Location Verification Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
              <Navigation className="text-[#0F9D8A]" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">Location Integrity</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                   <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Calculated Variance</p>
                   <p className={`text-3xl font-black ${verification.distanceKm <= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                     {verification.distanceKm !== null ? `${verification.distanceKm.toFixed(3)} km` : 'Unknown'}
                   </p>
                   <p className="text-sm font-medium text-[#64748B] mt-2">Distance from reported issue coordinates</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center">
                   <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Worker Coordinates</p>
                   <p className="text-lg font-bold text-[#0F172A]">{verification.latitude}, {verification.longitude}</p>
                </div>
              </div>
              
              {verification.distanceKm > 0.5 && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 flex items-start gap-3 text-sm font-medium">
                  <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
                  <p>Warning: The worker's reported location is significantly far from the original issue coordinates. Please verify the provided media evidence carefully before approving.</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Media Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
              <ImageIcon className="text-[#0F9D8A]" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">Visual Evidence</h2>
            </div>
            <div className="p-8">
              {verification.media && verification.media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {verification.media.map(media => (
                    <div 
                      key={media.id} 
                      onClick={() => openMedia(media.mediaUrl)}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                    >
                      {media.mediaType === 'IMAGE' ? (
                        <img src={media.mediaUrl} alt="Evidence" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <video src={media.mediaUrl} className="object-cover w-full h-full" />
                      )}
                      <div className="absolute inset-0 bg-[#0B1F3A]/0 group-hover:bg-[#0B1F3A]/30 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                        <span className="text-white font-bold flex items-center text-sm"><ImageIcon size={16} className="mr-2" /> View Full</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <ImageIcon size={40} className="mx-auto text-[#64748B] opacity-50 mb-4" />
                  <p className="text-[#64748B] font-medium">No visual evidence provided.</p>
                </div>
              )}
            </div>
          </div>

          {/* Site Condition & Notes */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E2E8F0] bg-slate-50 flex items-center gap-3">
              <FileText className="text-[#0F9D8A]" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">Worker Assessment</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Reported Site Condition</h3>
                <p className="text-[#0F172A] font-medium bg-slate-50 p-5 rounded-2xl border border-slate-200 text-lg">
                  {verification.siteCondition || 'No condition provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Additional Notes</h3>
                <p className="text-[#334155] whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  {verification.notes || 'No notes provided.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Manager Action Panel */}
          {verification.status === 'PENDING' && (
            <div className="bg-white rounded-3xl shadow-sm border-2 border-[#0B1F3A] overflow-hidden sticky top-8">
              <div className="bg-[#0B1F3A] px-6 py-5">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <CheckSquare size={20} className="text-[#0F9D8A]" /> Manager Decision
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm font-medium text-[#64748B] mb-6">Review the location variance and visual evidence before approving the worker to start.</p>
                
                <button
                  onClick={() => handleReview('APPROVE')}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  <CheckCircle size={18} className="mr-2" /> Approve & Allow Work
                </button>
                <button
                  onClick={() => handleReview('REVISION_REQUESTED')}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-orange-800 bg-orange-100 hover:bg-orange-200 border border-orange-200 transition-colors shadow-sm"
                >
                  <RefreshCw size={18} className="mr-2" /> Request Revision
                </button>
                <button
                  onClick={() => handleReview('REJECT')}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-red-800 bg-red-100 hover:bg-red-200 border border-red-200 transition-colors shadow-sm"
                >
                  <XCircle size={18} className="mr-2" /> Reject Verification
                </button>
              </div>
            </div>
          )}

          {/* Context: Issue & Worker */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
             <div className="bg-slate-50 px-6 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-lg font-bold text-[#0B1F3A]">Context Information</h2>
             </div>
             <div className="p-6 space-y-8">
                
                <div>
                  <h3 className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider mb-4 flex items-center">
                    <FileText size={14} className="mr-1.5" /> Issue Reference
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm font-black text-[#0F172A]">{issue.title}</p>
                    <p className="text-xs font-bold text-[#64748B] bg-slate-100 px-2 py-1 rounded-md w-fit border border-slate-200">{issue.category}</p>
                    <p className="text-sm text-[#334155] flex items-start">
                      <MapPin size={14} className="mr-1.5 mt-0.5 shrink-0 text-[#64748B]" />
                      {issue.address}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                <div>
                  <h3 className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider mb-4 flex items-center">
                    <User size={14} className="mr-1.5" /> Assigned Worker
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm font-black text-[#0F172A]">{worker.name}</p>
                    <p className="text-sm text-[#334155] font-medium">{worker.experienceYears} Years Experience</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                       <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Assignment Timestamp</p>
                       <p className="text-sm font-bold text-[#0F172A]">{format(new Date(assignment.assignedDate), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </div>

             </div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.show && (
        <div className="fixed inset-0 bg-[#0B1F3A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`px-6 py-4 border-b ${
              reviewModal.action === 'APPROVE' ? 'bg-green-50 border-green-200' :
              reviewModal.action === 'REJECT' ? 'bg-red-50 border-red-200' :
              'bg-orange-50 border-orange-200'
            }`}>
              <h3 className={`text-xl font-black flex items-center gap-2 ${
                reviewModal.action === 'APPROVE' ? 'text-green-800' :
                reviewModal.action === 'REJECT' ? 'text-red-800' :
                'text-orange-800'
              }`}>
                {reviewModal.action === 'APPROVE' ? <CheckCircle size={24} /> : 
                 reviewModal.action === 'REJECT' ? <XCircle size={24} /> : 
                 <RefreshCw size={24} />}
                {reviewModal.action === 'APPROVE' ? 'Confirm Approval' : 
                 reviewModal.action === 'REJECT' ? 'Confirm Rejection' : 
                 'Request Revision'}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {reviewModal.action === 'APPROVE' ? (
                <p className="text-[#334155] font-medium text-lg leading-relaxed">
                  Are you sure you want to approve this verification? The worker will be authorized to begin work, and the assignment status will change to <span className="font-bold text-[#0F172A]">IN PROGRESS</span>.
                </p>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-[#0F172A] mb-2">
                    Reason for {reviewModal.action === 'REJECT' ? 'Rejection' : 'Revision'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-[#0B1F3A] focus:border-[#0B1F3A] transition-shadow resize-none"
                    rows="4"
                    value={reviewModal.reason}
                    onChange={(e) => setReviewModal({...reviewModal, reason: e.target.value})}
                    placeholder={`Please explain why you are ${reviewModal.action === 'REJECT' ? 'rejecting' : 'requesting a revision'}...`}
                    required
                  ></textarea>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setReviewModal({ show: false, action: '', reason: '' })}
                className="px-6 py-2.5 text-[#64748B] font-bold hover:bg-slate-200 rounded-xl transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                className={`px-6 py-2.5 text-white font-bold rounded-xl transition-colors shadow-sm ${
                  reviewModal.action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' :
                  reviewModal.action === 'REJECT' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeWorkVerificationDetails;
