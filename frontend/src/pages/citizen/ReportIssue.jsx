import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssueCategories, createIssue } from '../../services/issueService';
import { MapPin, Upload, X, AlertCircle, Loader, FileImage, FileText, LayoutList, Navigation, CheckCircle2 } from 'lucide-react';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [files, setFiles] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getIssueCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      setError('You can only upload up to 5 files maximum.');
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
        setError('');
      },
      (err) => {
        setError('Unable to retrieve your location. Please ensure location permissions are granted.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      
      files.forEach(file => {
        data.append('media', file);
      });

      await createIssue(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] p-10 text-center">
          <div className="w-24 h-24 bg-[#0F9D8A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-[#0F9D8A]" />
          </div>
          <h2 className="text-3xl font-black text-[#0B1F3A] mb-4 tracking-tight">Issue Reported Successfully</h2>
          <p className="text-[#64748B] text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Thank you for helping improve our community. Your issue has been successfully submitted and is now under review.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setFormData({ categoryId: '', title: '', description: '', latitude: '', longitude: '', address: '' });
                setFiles([]);
                setSuccess(false);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#E2E8F0] text-[#0B1F3A] rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Report Another Issue
            </button>
            <button
              onClick={() => navigate('/citizen/my-issues')}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] text-white rounded-xl font-bold hover:bg-[#12345B] transition-colors shadow-lg shadow-[#0B1F3A]/20"
            >
              View My Issues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight mb-2">Report a Civic Issue</h1>
        <p className="text-lg text-[#64748B]">Help improve your community by reporting a civic problem.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-start border border-red-100 shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Details */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center">
            <LayoutList className="text-[#0F9D8A] mr-3" size={24} />
            <h2 className="text-xl font-bold text-[#0B1F3A]">1. Issue Details</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] transition-all hover:border-slate-300"
                >
                  <option value="" disabled>Select the most appropriate category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#64748B]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={255}
                className="w-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] transition-all hover:border-slate-300 placeholder:text-slate-400"
                placeholder="e.g., Pothole on MG Road"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2 flex justify-between">
                <span>Description <span className="text-red-500">*</span></span>
                <span className="text-xs font-normal text-slate-400 font-mono">{formData.description.length} chars</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] transition-all hover:border-slate-300 placeholder:text-slate-400 resize-y"
                placeholder="Provide detailed information about the issue to help workers locate and resolve it quickly..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Location */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="text-[#0F9D8A] mr-3" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">2. Location</h2>
            </div>
            {(formData.latitude && formData.longitude) && (
              <span className="bg-[#0F9D8A]/10 text-[#0F9D8A] text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <CheckCircle2 size={12} className="mr-1" /> Location Set
              </span>
            )}
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-[#0F172A] mb-1">GPS Coordinates</h3>
                  <p className="text-sm text-[#64748B]">Precise coordinates help exact localization.</p>
                </div>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="bg-white border-2 border-[#E2E8F0] text-[#0B1F3A] px-5 py-2.5 rounded-xl hover:border-[#0F9D8A] hover:text-[#0F9D8A] hover:bg-[#0F9D8A]/5 flex items-center justify-center transition-all font-bold disabled:opacity-50 disabled:pointer-events-none"
                >
                  {locationLoading ? <Loader className="animate-spin mr-2" size={18} /> : <Navigation className="mr-2" size={18} />}
                  {formData.latitude ? 'Update Location' : 'Use Current Location'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-wider">Latitude</label>
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono text-[#0F172A]">
                    {formData.latitude || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] mb-1 uppercase tracking-wider">Longitude</label>
                  <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono text-[#0F172A]">
                    {formData.longitude || 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-2">Detailed Address / Landmark <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#0F9D8A]/20 focus:border-[#0F9D8A] transition-all hover:border-slate-300 placeholder:text-slate-400"
                placeholder="e.g., Near Main Market, Sector 12"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Media */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center">
              <FileImage className="text-[#0F9D8A] mr-3" size={24} />
              <h2 className="text-xl font-bold text-[#0B1F3A]">3. Supporting Media</h2>
            </div>
            <span className="text-sm font-medium text-[#64748B]">{files.length} / 5 files</span>
          </div>

          <div className="p-6 sm:p-8">
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${files.length >= 5 ? 'border-red-200 bg-red-50' : 'border-slate-300 hover:border-[#0F9D8A] hover:bg-[#0F9D8A]/5 cursor-pointer'}`}
              onClick={() => files.length < 5 && fileInputRef.current?.click()}
            >
              <Upload className={`mx-auto h-12 w-12 mb-4 ${files.length >= 5 ? 'text-red-300' : 'text-slate-400'}`} />
              <p className="text-lg font-bold text-[#0B1F3A] mb-1">
                {files.length >= 5 ? 'Maximum files reached' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-[#64748B]">PNG, JPG, or Video up to 10MB each (max 5)</p>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 5}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between group">
                    <div className="flex items-center overflow-hidden mr-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                        <FileImage size={20} className="text-[#64748B]" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-[#0F172A] truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-[#64748B]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Submit */}
        <div className="bg-slate-50 border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center text-[#64748B]">
            <FileText size={20} className="mr-3 text-[#0F9D8A]" />
            <p className="text-sm">By submitting, you agree that the provided information is accurate.</p>
          </div>
          
          <div className="flex items-center w-full sm:w-auto gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-6 py-3.5 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl font-bold hover:bg-slate-50 transition-colors w-full sm:w-auto disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#0B1F3A] text-white rounded-xl font-bold hover:bg-[#12345B] transition-colors shadow-lg shadow-[#0B1F3A]/20 flex items-center justify-center w-full sm:w-auto min-w-[200px] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ReportIssue;
