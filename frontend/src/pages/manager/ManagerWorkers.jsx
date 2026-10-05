import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, AlertCircle, ChevronRight, Star, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import managerService from '../../services/managerService';

const ManagerWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerService.getWorkers();
      setWorkers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'AVAILABLE': 'bg-green-50 text-green-700 border-green-200',
      'ON_LEAVE': 'bg-amber-50 text-amber-700 border-amber-200',
      'BUSY': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] mb-2 tracking-tight">Worker Directory</h1>
          <p className="text-[#64748B] text-lg">Manage, monitor, and assign tasks to field workers.</p>
        </div>
        <button 
          onClick={fetchWorkers}
          className="p-3 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Refresh workers"
        >
          <RefreshCw size={20} className={loading ? "animate-spin text-[#0F9D8A]" : "text-[#64748B]"} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 flex items-center border border-red-100 shadow-sm">
          <AlertCircle className="mr-3 flex-shrink-0" size={24} />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={fetchWorkers} className="text-red-700 font-bold hover:underline px-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between min-h-[200px] animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-50 rounded w-full"></div>
                <div className="h-4 bg-slate-50 rounded w-full"></div>
              </div>
              <div className="h-10 bg-slate-50 rounded-xl w-full border border-slate-100 mt-4"></div>
            </div>
          ))}
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-[#64748B] opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">No Workers Found</h3>
          <p className="text-[#64748B] max-w-sm mx-auto">
            There are currently no active workers registered in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:border-[#0F9D8A] transition-all flex flex-col group">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0F9D8A] to-[#0B1F3A] flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                    {worker.user?.name?.charAt(0).toUpperCase() || 'W'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-[#0F172A] truncate" title={worker.user?.name}>
                      {worker.user?.name || 'Unknown'}
                    </h3>
                    <div className="flex items-center mt-0.5 bg-amber-50 px-2 py-0.5 rounded-md w-fit border border-amber-100">
                      <Star size={12} className="text-amber-500 fill-current" />
                      <span className="text-xs font-black text-amber-900 ml-1.5">{worker.rating ? worker.rating.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[#64748B] font-bold text-xs uppercase tracking-wider flex items-center">
                      <CheckCircle size={14} className="mr-1.5" />Status
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(worker.status)}`}>
                      {getStatusLabel(worker.status)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[#64748B] font-bold text-xs uppercase tracking-wider flex items-center">
                      <MapPin size={14} className="mr-1.5" />Location
                    </span>
                    <span className="font-bold text-[#0F172A]">
                      {worker.currentLocation ? 'Live Tracking' : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto px-6 pb-6">
                <Link 
                  to={`/manager/workers/${worker.id}`} 
                  className="w-full text-sm text-[#0B1F3A] font-bold flex items-center justify-center bg-white border-2 border-[#E2E8F0] px-4 py-2.5 rounded-xl group-hover:border-[#0B1F3A] transition-colors"
                >
                  View Profile <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerWorkers;
