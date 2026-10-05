import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getIssueDetails, getReview, getFeedback, submitReview, submitFeedback } from '../../services/issueService';
import { MapPin, Calendar, Tag, AlertCircle, ArrowLeft, Image as ImageIcon, Video, Clock, CheckCircle2, Star, ThumbsUp, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';

const IssueDetails = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [review, setReview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const data = await getIssueDetails(id);
      setIssue(data);
      
      if (data.status === 'RESOLVED') {
        try {
          const rev = await getReview(id);
          setReview(rev);
        } catch(e) {}
        try {
          const fdbk = await getFeedback(id);
          setFeedback(fdbk);
        } catch(e) {}
      }
    } catch (err) {
      setError('Failed to fetch issue details. You might not have permission to view this issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return alert('Please select a rating');
    setSubmittingReview(true);
    try {
      const res = await submitReview(id, reviewForm);
      setReview(res);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackForm.rating === 0) return alert('Please select a rating');
    setSubmittingFeedback(true);
    try {
      const res = await submitFeedback(id, feedbackForm);
      setFeedback(res);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating, setRating, readOnly, isSmall = false) => {
    return (
      <div className="flex space-x-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && setRating(star)}
            className={`focus:outline-none transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
          >
            <Star
              size={isSmall ? 20 : 28}
              className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getStatusStyle = (status) => {
    const styles = {
      REPORTED: 'bg-blue-50 text-blue-700 border-blue-200',
      APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
      ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
      WORK_STARTED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      WORK_COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      UNDER_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
      RESOLVED: 'bg-green-50 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      REPORTED: 'Reported',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      ASSIGNED: 'Assigned',
      WORK_STARTED: 'In Progress',
      WORK_COMPLETED: 'Work Completed',
      UNDER_VERIFICATION: 'Under Review',
      RESOLVED: 'Resolved'
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse flex flex-col space-y-6">
          <div className="w-32 h-6 bg-slate-200 rounded-md"></div>
          <div className="h-48 bg-slate-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-200 rounded-3xl"></div>
            </div>
            <div className="h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-red-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-[#0B1F3A] mb-4">Issue Not Found</h2>
        <p className="text-[#64748B] text-lg mb-8">{error}</p>
        <Link 
          to="/citizen/my-issues" 
          className="inline-flex items-center px-6 py-3 bg-[#0B1F3A] text-white rounded-xl font-bold hover:bg-[#12345B] transition-colors shadow-lg shadow-[#0B1F3A]/20"
        >
          <ArrowLeft className="mr-2" size={20} />
          Return to My Issues
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-500">
      <Link 
        to="/citizen/my-issues" 
        className="inline-flex items-center text-[#64748B] font-semibold hover:text-[#0B1F3A] mb-6 transition-colors bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl shadow-sm hover:shadow"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to My Issues
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-6 relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#0B1F3A]"></div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] leading-tight">
              {issue.title}
            </h1>
            <span className={`px-4 py-1.5 inline-flex text-sm font-bold rounded-full border whitespace-nowrap ${getStatusStyle(issue.status)}`}>
              {getStatusLabel(issue.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#64748B]">
            <span className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg text-[#0F172A]">
              <Tag size={16} className="mr-2 text-[#0F9D8A]" />
              {issue.category.name}
            </span>
            <span className="flex items-center">
              <Calendar size={16} className="mr-2 text-slate-400" />
              {format(new Date(issue.createdAt), 'MMMM d, yyyy • h:mm a')}
            </span>
            <span className="flex items-center px-2 py-1 bg-slate-50 border border-[#E2E8F0] rounded text-xs font-mono">
              ID: #{issue.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#0B1F3A] mb-4 flex items-center">
              <AlignLeft size={20} className="mr-2 text-[#0F9D8A]" />
              Issue Description
            </h3>
            <p className="text-[#0F172A] leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Location Details */}
          {(issue.address || (issue.latitude && issue.longitude)) && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#0B1F3A] mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-[#0F9D8A]" />
                Location
              </h3>
              
              <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-5">
                {issue.address && (
                  <p className="text-[#0F172A] font-medium mb-3 flex items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A] mt-2 mr-3 flex-shrink-0"></span>
                    {issue.address}
                  </p>
                )}
                
                {issue.latitude && issue.longitude && (
                  <div className="flex gap-4 border-t border-[#E2E8F0] pt-3 mt-3">
                    <div>
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Latitude</span>
                      <span className="text-sm font-mono text-[#0F172A]">{issue.latitude.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">Longitude</span>
                      <span className="text-sm font-mono text-[#0F172A]">{issue.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Evidence */}
          {issue.media && issue.media.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#0B1F3A] mb-4 flex items-center">
                <ImageIcon size={20} className="mr-2 text-[#0F9D8A]" />
                Evidence Attached ({issue.media.length})
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {issue.media.map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-50 aspect-video flex items-center justify-center hover:shadow-md transition-all hover:border-[#0F9D8A]"
                  >
                    {item.mediaType === 'IMAGE' ? (
                      <img src={item.url} alt="Evidence" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="text-center p-4">
                        <Video size={32} className="mx-auto text-slate-400 mb-2 group-hover:text-[#0F9D8A] transition-colors" />
                        <span className="text-sm font-medium text-[#64748B]">Video</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#0B1F3A] bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-[#0B1F3A] bg-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                        View Full
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Post-Resolution Actions (Review & Feedback) */}
          {issue.status === 'RESOLVED' && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#16A34A] p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
              
              <div className="flex items-center mb-6 border-b border-[#E2E8F0] pb-4 relative z-10">
                <CheckCircle2 size={24} className="text-[#16A34A] mr-3" />
                <h3 className="text-xl font-bold text-[#0B1F3A]">Issue Resolved</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Worker Review */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-[#E2E8F0] flex flex-col h-full">
                  <div className="mb-4">
                    <h4 className="font-bold text-[#0B1F3A] mb-1 flex items-center">
                      <Star size={18} className="mr-2 text-[#F59E0B]" />
                      Worker Performance
                    </h4>
                    <p className="text-sm text-[#64748B]">Rate the worker's effort on this issue.</p>
                  </div>
                  
                  {review ? (
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] mt-auto">
                      <div className="mb-3">{renderStars(review.rating, null, true, true)}</div>
                      {review.comment && (
                        <p className="text-sm text-[#0F172A] italic border-l-2 border-slate-200 pl-3 mb-2">"{review.comment}"</p>
                      )}
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                        {format(new Date(review.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 mt-auto">
                      <div>
                        {renderStars(reviewForm.rating, (val) => setReviewForm({...reviewForm, rating: val}), false)}
                      </div>
                      <textarea
                        className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent placeholder:text-slate-400"
                        rows={2}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                        placeholder="Add a comment (optional)..."
                      />
                      <button
                        type="submit"
                        disabled={submittingReview || reviewForm.rating === 0}
                        className="w-full bg-[#0B1F3A] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#12345B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Platform Feedback */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-[#E2E8F0] flex flex-col h-full">
                  <div className="mb-4">
                    <h4 className="font-bold text-[#0B1F3A] mb-1 flex items-center">
                      <ThumbsUp size={18} className="mr-2 text-[#0F9D8A]" />
                      Platform Experience
                    </h4>
                    <p className="text-sm text-[#64748B]">Rate your experience with SAMADHAN.</p>
                  </div>
                  
                  {feedback ? (
                    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] mt-auto">
                      <div className="mb-3">{renderStars(feedback.rating, null, true, true)}</div>
                      {feedback.comment && (
                        <p className="text-sm text-[#0F172A] italic border-l-2 border-slate-200 pl-3 mb-2">"{feedback.comment}"</p>
                      )}
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
                        {format(new Date(feedback.timestamp), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4 mt-auto">
                      <div>
                        {renderStars(feedbackForm.rating, (val) => setFeedbackForm({...feedbackForm, rating: val}), false)}
                      </div>
                      <textarea
                        className="w-full bg-white border border-[#E2E8F0] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] focus:border-transparent placeholder:text-slate-400"
                        rows={2}
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                        placeholder="Add a comment (optional)..."
                      />
                      <button
                        type="submit"
                        disabled={submittingFeedback || feedbackForm.rating === 0}
                        className="w-full bg-white border-2 border-[#0B1F3A] text-[#0B1F3A] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Timeline Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8 sticky top-6">
            <h3 className="text-lg font-bold text-[#0B1F3A] mb-6 flex items-center">
              <Clock size={20} className="mr-2 text-[#0F9D8A]" />
              Status Timeline
            </h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {issue.statusHistory.map((history, idx) => {
                  const isLast = idx === issue.statusHistory.length - 1;
                  return (
                    <li key={history.id}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[#E2E8F0]" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-4">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm border border-[#E2E8F0] ${isLast ? 'bg-[#0B1F3A]' : 'bg-white'}`}>
                              {isLast ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#0F9D8A]"></div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex flex-col">
                            <div>
                              <p className="text-sm font-bold text-[#0F172A]">
                                {getStatusLabel(history.newStatus)}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                                {format(new Date(history.createdAt), 'MMM d, yyyy • h:mm a')}
                              </p>
                            </div>
                            {history.comments && (
                              <div className="mt-2 text-sm text-[#0F172A] bg-slate-50 border border-[#E2E8F0] p-3 rounded-xl rounded-tl-none italic">
                                {history.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* Resolution Empty State indicator if not resolved */}
            {issue.status !== 'RESOLVED' && (
              <div className="mt-12 text-center border-t border-dashed border-[#E2E8F0] pt-6 opacity-60">
                <CheckCircle2 size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Pending Resolution</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default IssueDetails;
