import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const RecentCivicActivity = ({ issues: propIssues, loading: propLoading }) => {
  const [internalIssues, setInternalIssues] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    if (propIssues !== undefined) return;

    let isMounted = true;
    api.get('/issues/public-map')
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setInternalIssues(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load recent activity:', err);
      })
      .finally(() => {
        if (isMounted) setInternalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propIssues]);

  const issues = propIssues !== undefined ? propIssues : internalIssues;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  const recentList = issues.slice(0, 6);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ASSIGNED':
      case 'WORK_STARTED':
      case 'WORK_COMPLETED':
      case 'UNDER_VERIFICATION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REPORTED':
      case 'APPROVED':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Recent Civic Activity
              </h2>
              <p className="text-slate-500 text-sm mt-1">Live stream of citizen reports and field repairs</p>
            </div>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            Report an Issue <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 h-44 animate-pulse"></div>
            ))}
          </div>
        ) : recentList.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
            <Activity className="h-10 w-10 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No civic activity recorded yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Issues submitted by citizens will appear here in real-time as they are processed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentList.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <Tag className="h-3 w-3 mr-1 text-slate-400" />
                      {issue.category || 'General'}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-lg border ${getStatusBadge(issue.status)}`}>
                      {issue.status ? issue.status.replace(/_/g, ' ') : 'Reported'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">
                    {issue.title || 'Civic Issue'}
                  </h4>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                    <span>
                      {issue.latitude && issue.longitude
                        ? `${parseFloat(issue.latitude).toFixed(3)}°N, ${parseFloat(issue.longitude).toFixed(3)}°E`
                        : 'Coordinates logged'}
                    </span>
                  </div>
                  <span className="text-teal-600 font-semibold">Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentCivicActivity;
