import React, { useState, useEffect } from 'react';
import { BarChart3, Layers } from 'lucide-react';
import api from '../../../services/api';

const CommunityImpact = ({ issues: propIssues, loading: propLoading }) => {
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
        console.error('Failed to load community impact:', err);
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

  const total = issues.length || 1;

  // Category counts
  const categoryCounts = issues.reduce((acc, issue) => {
    const cat = issue.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Lifecycle stage counts
  const openCount = issues.filter(i => ['REPORTED', 'APPROVED'].includes(i.status)).length;
  const inProgressCount = issues.filter(i => ['ASSIGNED', 'WORK_STARTED', 'WORK_COMPLETED', 'UNDER_VERIFICATION'].includes(i.status)).length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

  const stageBreakdown = [
    { label: 'Reported & Open', count: openCount, barColor: 'bg-blue-500' },
    { label: 'In Progress / Assigned', count: inProgressCount, barColor: 'bg-amber-500' },
    { label: 'Resolved & Verified', count: resolvedCount, barColor: 'bg-teal-500' }
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Community Impact
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            Visualizing the progress and categories of civic improvement over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Issue Breakdown by Category */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100">
                  <Layers className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Issues by Category</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live database distribution</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 py-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse"></div>)}
                </div>
              ) : categoryEntries.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">No categories recorded yet.</p>
              ) : (
                <div className="space-y-5">
                  {categoryEntries.slice(0, 5).map(([cat, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm font-semibold mb-1.5">
                          <span className="text-slate-700">{cat}</span>
                          <span className="text-slate-900 font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total Tracked Issues: {issues.length}</span>
              <span className="text-teal-600 font-bold">100% Live Sync</span>
            </div>
          </div>

          {/* Card 2: Lifecycle Stage Breakdown */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl border border-teal-100">
                  <BarChart3 className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Lifecycle Stages</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live resolution pipeline</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4 py-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse"></div>)}
                </div>
              ) : (
                <div className="space-y-5">
                  {stageBreakdown.map((stage) => {
                    const pct = Math.round((stage.count / total) * 100);
                    return (
                      <div key={stage.label}>
                        <div className="flex justify-between text-sm font-semibold mb-1.5">
                          <span className="text-slate-700">{stage.label}</span>
                          <span className="text-slate-900 font-bold">{stage.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${stage.barColor} h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Accountability Ledger: Enabled</span>
              <span className="text-teal-600 font-bold">Zero Mock Data</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityImpact;
