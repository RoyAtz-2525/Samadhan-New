import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import superAdminService from '../../services/superAdmin/superAdminService';
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Calendar, 
  CheckCircle,
  FileText,
  AlertCircle,
  HardHat,
  CheckSquare,
  Clock,
  Shield,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

const SuperAdminAppraisalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppraisalDetail();
  }, [id]);

  const fetchAppraisalDetail = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getAppraisalDetail(id);
      setAppraisal(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch appraisal details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
      case 'SUBMITTED': return 'bg-yellow-50 text-[#F59E0B] border-yellow-200';
      case 'ACKNOWLEDGED': return 'bg-emerald-50 text-[#16A34A] border-emerald-200';
      default: return 'bg-gray-50 text-[#64748B] border-[#E2E8F0]';
    }
  };

  const renderRatingBar = (label, rating) => (
    <div>
      <div className="flex justify-between mb-1.5 items-center">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-[#0F172A]">{rating || 0}<span className="text-[#64748B] text-xs">/5</span></span>
      </div>
      <div className="w-full bg-[#F5F7FA] rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            (rating || 0) >= 4 ? 'bg-[#16A34A]' : 
            (rating || 0) >= 3 ? 'bg-[#F59E0B]' : 'bg-[#DC2626]'
          }`} 
          style={{ width: `${((rating || 0)/5)*100}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3A]"></div>
      </div>
    );
  }

  if (error || !appraisal) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 flex items-center space-x-3">
          <AlertCircle size={20} />
          <span className="font-medium">{error || 'Appraisal not found'}</span>
        </div>
        <button 
          onClick={() => navigate('/super-admin/appraisals')}
          className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Appraisals
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/super-admin/appraisals')}
            className="p-2 bg-white border border-[#E2E8F0] rounded-full text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Appraisal Details</h1>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadgeColor(appraisal.status)}`}>
                {appraisal.status}
              </span>
            </div>
            <p className="text-sm text-[#64748B] font-mono mt-1">ID: {appraisal.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Context Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Period Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-5 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-[#3B82F6]" />
              Appraisal Period
            </h3>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-semibold text-[#0F172A]">{format(new Date(appraisal.periodStart), 'PPP')}</p>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">End Date</p>
                <p className="font-semibold text-[#0F172A]">{format(new Date(appraisal.periodEnd), 'PPP')}</p>
              </div>
              <div className="flex items-center text-xs text-[#64748B] mt-4 font-medium">
                <Clock className="w-4 h-4 mr-2" />
                Last Updated: {format(new Date(appraisal.updatedAt), 'PP p')}
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-5 flex items-center">
              <User className="w-4 h-4 mr-2 text-[#3B82F6]" />
              Participants
            </h3>
            
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center">
                  <HardHat className="w-3.5 h-3.5 mr-1" /> Worker
                </p>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-[#0F172A] truncate">{appraisal.worker?.user?.email || 'Unknown'}</p>
                  <p className="text-sm text-[#64748B] mt-0.5">{appraisal.worker?.user?.phone || 'No phone'}</p>
                  <p className="text-[10px] text-[#64748B] font-mono mt-2 pt-2 border-t border-[#E2E8F0] truncate">ID: {appraisal.workerId}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center">
                  <CheckSquare className="w-3.5 h-3.5 mr-1" /> Evaluator (Manager)
                </p>
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <p className="font-bold text-[#0F172A] truncate">{appraisal.manager?.user?.email || 'Unknown'}</p>
                  <p className="text-sm text-[#64748B] mt-0.5">{appraisal.manager?.user?.phone || 'No phone'}</p>
                  <p className="text-[10px] text-[#64748B] font-mono mt-2 pt-2 border-t border-[#E2E8F0] truncate">ID: {appraisal.managerId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Appraisal Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ratings Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-6 flex items-center">
              <Star className="w-4 h-4 mr-2 text-[#F59E0B] fill-current" />
              Performance Ratings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Overall Score */}
              <div className="flex flex-col items-center justify-center bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-8">
                <p className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-3">Overall Rating</p>
                <div className="flex items-end justify-center">
                  <span className={`text-6xl font-black leading-none ${
                    appraisal.overallRating >= 4 ? 'text-[#16A34A]' :
                    appraisal.overallRating >= 3 ? 'text-[#F59E0B]' :
                    appraisal.overallRating ? 'text-[#DC2626]' : 'text-[#64748B]'
                  }`}>
                    {appraisal.overallRating || 'N/A'}
                  </span>
                  {appraisal.overallRating && <span className="text-2xl font-bold text-[#64748B] ml-1 mb-1">/5</span>}
                </div>
                
                {appraisal.overallRating && (
                  <div className="mt-4 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={24} 
                        className={star <= appraisal.overallRating ? 
                          (appraisal.overallRating >= 4 ? 'text-[#16A34A] fill-current' : appraisal.overallRating >= 3 ? 'text-[#F59E0B] fill-current' : 'text-[#DC2626] fill-current') 
                          : 'text-[#E2E8F0] fill-current'
                        } 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Detailed Metrics */}
              <div className="space-y-5 flex flex-col justify-center">
                {renderRatingBar('Work Quality', appraisal.workQualityRating)}
                {renderRatingBar('Timeliness', appraisal.timelinessRating)}
                {renderRatingBar('Reliability', appraisal.reliabilityRating)}
                {renderRatingBar('Professionalism', appraisal.professionalismRating)}
                {renderRatingBar('Communication', appraisal.communicationRating)}
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-5 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#3B82F6]" />
              Manager's Comments
            </h3>
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 min-h-[150px] whitespace-pre-wrap text-[15px]">
              {appraisal.managerComments ? (
                <span className="text-[#334155] leading-relaxed block">{appraisal.managerComments}</span>
              ) : (
                <span className="text-[#94A3B8] italic flex items-center justify-center h-full">No comments provided for this appraisal.</span>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAppraisalDetails;
