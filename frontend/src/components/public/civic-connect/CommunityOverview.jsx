import React, { useState, useEffect } from 'react';
import { AlertCircle, Search, HardHat, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';

const CommunityOverview = ({ issues: propIssues, loading: propLoading }) => {
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
        console.error('Failed to load community metrics:', err);
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

  const reportedCount = issues.filter(i => i.status === 'REPORTED').length;
  const underReviewCount = issues.filter(i => ['UNDER_REVIEW', 'APPROVED'].includes(i.status)).length;
  const inProgressCount = issues.filter(i => ['ASSIGNED', 'WORK_STARTED', 'WORK_COMPLETED', 'UNDER_VERIFICATION'].includes(i.status)).length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

  const metrics = [
    {
      title: 'Reported',
      count: reportedCount,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Under Review',
      count: underReviewCount,
      icon: Search,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'In Progress',
      count: inProgressCount,
      icon: HardHat,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Resolved',
      count: resolvedCount,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100'
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Community Overview
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A real-time snapshot of civic issues across all categories in the system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className={"rounded-3xl border " + metric.borderColor + " p-8 " + metric.bgColor + " flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg"}>
              <div className={"h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6 " + metric.color}>
                <metric.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">
                {metric.title}
              </h3>
              <div className="text-4xl font-extrabold text-slate-900 flex items-center justify-center tracking-tight">
                {loading ? '...' : metric.count}
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-4 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60 shadow-sm">
                Live Database Count
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityOverview;
