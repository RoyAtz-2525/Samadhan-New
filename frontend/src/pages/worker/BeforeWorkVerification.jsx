import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workerService from '../../services/workerService';
import { ArrowLeft, MapPin, Camera, FileText, CheckCircle2, AlertTriangle, AlertCircle, X, Check, XCircle, File } from 'lucide-react';

const BeforeWorkVerification = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();

  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationError, setLocationError] = useState('');
  const [siteCondition, setSiteCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [media, setMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await workerService.getBeforeVerification(assignmentId);
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
        setLocationError("Error getting location");
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

    try {
      setSubmitting(true);
      await workerService.submitBeforeVerification(assignmentId, {
        latitude,
        longitude,
        siteCondition,
        notes,
        media
      });
      navigate("/worker/assignments/");
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
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 h-48"></div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button onClick={() => navigate("/worker/assignments/")} className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors">
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
      <div className="mb-8 flex items-center">
        <button 
          onClick={() => navigate("/worker/assignments/")}
          className="mr-4 p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Before-Work Verification</h1>
          <p className="text-slate-500 font-medium mt-1">Verify site before starting work</p>
        </div>
      </div>

      {/* Assignment Summary Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 mb-3">
              {issue.category?.name || 'Uncategorized'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {issue.title}
            </h2>
          </div>
        </div>
        <div className="flex items-start gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-400 border border-slate-200">
            <MapPin size={20} />
          </div>
          <div>
             <p className="text-base font-bold text-slate-900 mt-1.5">{issue.address}</p>
          </div>
        </div>
      </div>

      {verification ? (
        <div className="bg-white rounded-3xl shadow-sm border-2 border-green-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <div className="bg-green-50 p-6 sm:p-8 flex items-start gap-4 sm:gap-6">
            <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold text-green-800 mb-2">Verification Submitted</h3>
              <p className="text-green-700 font-medium mb-6">You have already submitted the before-work verification.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-green-200">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Status</p>
                  <p className="font-bold text-green-900">{verification.status}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-green-200">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Submitted At</p>
                  <p className="font-bold text-green-900">{new Date(verification.timestamp).toLocaleString()}</p>
                </div>
                {verification.siteCondition && (
                  <div className="bg-white p-4 rounded-2xl border border-green-200 sm:col-span-2">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Site Condition</p>
                    <p className="font-bold text-green-900">{verification.siteCondition.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {verification.notes && (
                  <div className="bg-white p-4 rounded-2xl border border-green-200 sm:col-span-2">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Notes</p>
                    <p className="font-medium text-green-900">{verification.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Verification Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-[#0B1F3A]" strokeWidth={2.5} />
                <h3 className="text-xl font-extrabold text-slate-900">Location Verification</h3>
              </div>
              <p className="text-slate-500 font-medium">Verify you are at the correct location.</p>
            </div>
            
            <div className="p-6 sm:p-8">
              {!latitude || !longitude ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                    <MapPin size={32} strokeWidth={2} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Verify Your Location</h4>
                  <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                    We need to capture your current location to verify you are at the site.
                  </p>
                  
                  {locationError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-medium">
                      {locationError}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="px-8 py-3.5 bg-[#0B1F3A] text-white font-bold rounded-xl hover:bg-[#12345B] disabled:opacity-50 transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    {gettingLocation ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin size={20} />
                        Capture Location
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-4 sm:gap-6 bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8">
                  <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="text-lg font-bold text-green-800 mb-4">Location Verified</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-green-100">
                          <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Latitude</p>
                          <p className="font-mono text-base font-bold text-green-900">{latitude.toFixed(6)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-green-100">
                          <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1.5">Longitude</p>
                          <p className="font-mono text-base font-bold text-green-900">{longitude.toFixed(6)}</p>
                        </div>
                      </div>
                      
                      {distanceKm !== null && (
                        <div className="p-4 rounded-2xl flex items-start gap-4 border">
                          {distanceKm <= 0.5 ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                          )}
                          <div>
                            <p className="font-bold">
                              Distance from issue: {distanceKm.toFixed(2)} km
                            </p>
                            {distanceKm > 0.5 && (
                              <p className="text-sm text-amber-700 mt-1 font-medium">You might be too far away from the reported location.</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="mt-2 text-sm font-bold text-[#3B82F6] hover:text-blue-700 underline"
                      >
                        Recapture Location
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-6 h-6 text-[#0B1F3A]" strokeWidth={2.5} />
                <h3 className="text-xl font-extrabold text-slate-900">Site Inspection</h3>
              </div>
              <p className="text-slate-500 font-medium">Provide condition details and visual evidence.</p>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Site Condition</label>
                <select
                  value={siteCondition}
                  onChange={(e) => setSiteCondition(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white appearance-none text-slate-900"
                >
                  <option value="">Select condition...</option>
                  <option value="AS_REPORTED">Matches report exactly</option>
                  <option value="WORSE_THAN_REPORTED">Worse than reported</option>
                  <option value="BETTER_THAN_REPORTED">Better than reported / Partially resolved</option>
                  <option value="UNABLE_TO_LOCATE">Cannot locate the issue</option>
                  <option value="UNSAFE">Unsafe to proceed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Verification Notes</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white placeholder:text-slate-400 text-slate-900"
                  placeholder="Describe the current state of the issue before starting work..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Before-Work Evidence (Photos/Videos)</label>
                
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
                  <Camera className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-base font-bold text-slate-900 mb-1">Capture or Select Media</p>
                  <p className="text-sm text-slate-500 font-medium mb-6">Max 5 files (Images or Videos)</p>
                  
                  <label className="cursor-pointer inline-flex px-8 py-3.5 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
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
                  <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Selected Files ({media.length}/5)</h4>
                    <ul className="space-y-3">
                      {media.map((file, i) => (
                        <li key={i} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex items-center overflow-hidden">
                            <File className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" strokeWidth={2.5} />
                            <span className="text-sm font-bold text-slate-900 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMedia(i)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} strokeWidth={2.5} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting || !latitude || !longitude}
              className="w-full bg-[#0F9D8A] text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-600 disabled:opacity-50 transition-colors shadow-lg flex justify-center items-center gap-3"
            >
              {submitting ? 'Submitting Verification...' : 'Submit Before-Work Verification'}
            </button>
            <p className="text-center text-sm font-medium text-slate-500 mt-6 max-w-md mx-auto">
              By submitting, you confirm you are physically at the location and the condition represents reality.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default BeforeWorkVerification;



