import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import { ArrowLeft, MapPin, Camera, FileText, CheckCircle2, AlertTriangle, AlertCircle, X, Check, XCircle, File, Clock } from 'lucide-react';

const WorkerAfterWorkVerification = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();

  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationError, setLocationError] = useState('');
  const [workSummary, setWorkSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await workerService.getAfterVerification(assignmentId);
        setVerificationData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch verification status');
      } finally {
        setLoading(false);
      }
    };
    fetchVerificationStatus();
  }, [assignmentId]);

  const handleGetLocation = () => {
    setLocationError('');
    setGettingLocation(true);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingLocation(false);
      },
      (err) => {
        setLocationError(`Error getting location: ${err.message}`);
        setGettingLocation(false);
      }
    );
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (media.length + files.length > 5) {
      alert('You can only upload up to 5 media files.');
      return;
    }
    setMedia(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      alert('Please verify your location before submitting.');
      return;
    }
    if (!workSummary) {
      alert('Please select a work summary.');
      return;
    }

    try {
      setSubmitting(true);
      await workerService.submitAfterVerification(assignmentId, {
        latitude,
        longitude,
        workSummary,
        notes,
        media
      });
      navigate(`/worker/assignments/${assignmentId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 h-48"></div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/worker/assignments/${assignmentId}`)} className="px-6 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!verificationData) return null;

  const { assignment, issue, verification } = verificationData;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceKm = calculateDistance(latitude, longitude, issue.latitude, issue.longitude);

  return (
    <div className="max-w-3xl mx-auto pb-12 sm:pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate(`/worker/assignments/${assignmentId}`)}
          className="mr-4 p-2 bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-[#64748B]"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">After-Work Verification</h1>
          <p className="text-[#64748B] text-sm">Submit final proof of completion</p>
        </div>
      </div>

      {/* Assignment Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded border border-slate-200 mb-2">
              {issue.category?.name || 'Uncategorized'}
            </span>
            <h2 className="text-lg font-bold text-[#0F172A] leading-tight">
              {issue.title}
            </h2>
          </div>
        </div>
        <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
          <MapPin size={18} className="text-[#64748B] mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-[#334155]">{issue.address}</p>
        </div>
      </div>

      {verification && (verification.status === 'PENDING' || verification.status === 'APPROVED' || verification.status === 'REJECTED') ? (
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${
          verification.status === 'APPROVED' ? 'border-green-200' : 
          verification.status === 'REJECTED' ? 'border-red-200' : 
          'border-amber-200'
        }`}>
          <div className={`p-6 flex items-start gap-4 ${
            verification.status === 'APPROVED' ? 'bg-green-50' : 
            verification.status === 'REJECTED' ? 'bg-red-50' : 
            'bg-amber-50'
          }`}>
            <div className={`p-2 rounded-full flex-shrink-0 mt-1 ${
              verification.status === 'APPROVED' ? 'bg-green-100' : 
              verification.status === 'REJECTED' ? 'bg-red-100' : 
              'bg-amber-100'
            }`}>
              {verification.status === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : verification.status === 'REJECTED' ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-bold mb-1 ${
                verification.status === 'APPROVED' ? 'text-green-800' : 
                verification.status === 'REJECTED' ? 'text-red-800' : 
                'text-amber-800'
              }`}>
                Verification {verification.status}
              </h3>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`bg-white p-3 rounded-xl border ${
                  verification.status === 'APPROVED' ? 'border-green-200' : 
                  verification.status === 'REJECTED' ? 'border-red-200' : 
                  'border-amber-200'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    verification.status === 'APPROVED' ? 'text-green-600' : 
                    verification.status === 'REJECTED' ? 'text-red-600' : 
                    'text-amber-600'
                  }`}>Submitted At</p>
                  <p className={`font-medium ${
                    verification.status === 'APPROVED' ? 'text-green-900' : 
                    verification.status === 'REJECTED' ? 'text-red-900' : 
                    'text-amber-900'
                  }`}>{new Date(verification.timestamp).toLocaleString()}</p>
                </div>
                
                {verification.workSummary && (
                  <div className={`bg-white p-3 rounded-xl border ${
                    verification.status === 'APPROVED' ? 'border-green-200' : 
                    verification.status === 'REJECTED' ? 'border-red-200' : 
                    'border-amber-200'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      verification.status === 'APPROVED' ? 'text-green-600' : 
                      verification.status === 'REJECTED' ? 'text-red-600' : 
                      'text-amber-600'
                    }`}>Work Summary</p>
                    <p className={`font-medium ${
                      verification.status === 'APPROVED' ? 'text-green-900' : 
                      verification.status === 'REJECTED' ? 'text-red-900' : 
                      'text-amber-900'
                    }`}>{verification.workSummary.replace(/_/g, ' ')}</p>
                  </div>
                )}
                
                {verification.notes && (
                  <div className={`bg-white p-3 rounded-xl border sm:col-span-2 ${
                    verification.status === 'APPROVED' ? 'border-green-200' : 
                    verification.status === 'REJECTED' ? 'border-red-200' : 
                    'border-amber-200'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                      verification.status === 'APPROVED' ? 'text-green-600' : 
                      verification.status === 'REJECTED' ? 'text-red-600' : 
                      'text-amber-600'
                    }`}>Notes / Feedback</p>
                    <p className={`font-medium ${
                      verification.status === 'APPROVED' ? 'text-green-900' : 
                      verification.status === 'REJECTED' ? 'text-red-900' : 
                      'text-amber-900'
                    }`}>{verification.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {verification && verification.status === 'REVISION_REQUESTED' && (
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-bold mb-1">Revision Requested</h3>
                <p className="text-sm text-red-700 mb-2 font-medium">Manager Note: {verification.notes}</p>
                <p className="text-xs text-red-600">Please provide the updated details and evidence below to resubmit.</p>
              </div>
            </div>
          )}

          {/* Location Verification Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-[#0F172A]" />
                <h3 className="text-lg font-bold text-[#0F172A]">Location Verification</h3>
              </div>
              <p className="text-sm text-[#64748B]">You must verify your location to submit proof of work.</p>
            </div>
            <div className="p-6">
              {!latitude || !longitude ? (
                <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-[#0F172A] font-bold mb-2">Capture Current Location</h4>
                  <p className="text-sm text-[#64748B] mb-6 max-w-sm">Tap the button below to capture your GPS coordinates and prove you are on-site.</p>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="px-6 py-3 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {gettingLocation ? 'Capturing...' : 'Get My Current Location'}
                  </button>
                  {locationError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {locationError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="w-full">
                      <h4 className="text-green-800 font-bold mb-2">Location Captured</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-green-100">
                          <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Latitude</p>
                          <p className="font-mono text-sm font-medium text-green-900">{latitude.toFixed(6)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-green-100">
                          <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Longitude</p>
                          <p className="font-mono text-sm font-medium text-green-900">{longitude.toFixed(6)}</p>
                        </div>
                      </div>
                      
                      {distanceKm !== null && (
                        <div className={`p-3 rounded-lg flex items-start gap-3 border ${distanceKm <= 0.5 ? 'bg-white border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                          {distanceKm <= 0.5 ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className={`font-medium ${distanceKm <= 0.5 ? 'text-green-800' : 'text-amber-800'}`}>
                              Distance from issue: {distanceKm.toFixed(2)} km
                            </p>
                            {distanceKm > 0.5 && (
                              <p className="text-sm text-amber-700 mt-1">You might be too far away from the reported location.</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="mt-4 text-sm font-semibold text-[#3B82F6] hover:text-blue-700 underline"
                      >
                        Recapture Location
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Summary & Evidence Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-[#0F172A]" />
                <h3 className="text-lg font-bold text-[#0F172A]">Work Summary</h3>
              </div>
              <p className="text-sm text-[#64748B]">Provide final status and visual evidence of completion.</p>
            </div>
            <div className="p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Overall Work Summary</label>
                <select
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] transition-all bg-white appearance-none"
                >
                  <option value="">Select status...</option>
                  <option value="FULLY_RESOLVED">Fully Resolved</option>
                  <option value="PARTIALLY_RESOLVED">Partially Resolved (More work needed)</option>
                  <option value="UNABLE_TO_RESOLVE">Unable to Resolve</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">Detailed Notes</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-[#E2E8F0] rounded-xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] transition-all bg-white placeholder:text-slate-400"
                  placeholder="Describe the final state of the work done..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">After-Work Evidence (Photos/Videos)</label>
                
                <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                  <Camera className="mx-auto h-10 w-10 text-[#64748B] mb-3" />
                  <p className="text-sm font-medium text-[#0F172A] mb-1">Capture or Select Media</p>
                  <p className="text-xs text-[#64748B] mb-4">Max 5 files (Images or Videos)</p>
                  
                  <label className="cursor-pointer inline-flex px-6 py-2.5 bg-white border-2 border-[#E2E8F0] text-[#0F172A] font-bold rounded-xl hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors shadow-sm">
                    <span>Choose Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {media.length > 0 && (
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-[#E2E8F0]">
                    <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Selected Files ({media.length}/5)</h4>
                    <ul className="space-y-2">
                      {media.map((file, i) => (
                        <li key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center overflow-hidden">
                            <File className="w-5 h-5 text-[#3B82F6] mr-3 flex-shrink-0" />
                            <span className="text-sm font-medium text-[#0F172A] truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedia(i)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || !latitude || !longitude || !workSummary}
              className="w-full bg-[#0F9D8A] text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-600 disabled:opacity-50 transition-colors shadow-md flex justify-center items-center gap-2"
            >
              {submitting ? 'Submitting Verification...' : 'Submit After-Work Verification'}
            </button>
            <p className="text-center text-xs text-[#64748B] mt-4">
              Once submitted, the manager will review your work for appraisal.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkerAfterWorkVerification;
