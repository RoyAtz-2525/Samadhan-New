import React from 'react';
import { Camera, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

const ResolutionStories = ({ issues = [] }) => {
  const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED');

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-100 px-4 py-1.5 rounded-full text-xs font-bold text-teal-700 uppercase tracking-widest mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Ground Truth</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Resolution Stories
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            See actual examples of civic issues moving from citizen report to verified on-ground resolution.
          </p>
        </div>

        {resolvedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resolvedIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="h-48 bg-slate-100 flex flex-col items-center justify-center text-teal-600 p-6 relative">
                  <CheckCircle2 className="h-16 w-16 mb-2 text-teal-500" />
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Field Verified Resolution</span>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {issue.category || 'Civic'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                      {issue.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center text-xs font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {issue.latitude && issue.longitude
                        ? `${parseFloat(issue.latitude).toFixed(3)}°N, ${parseFloat(issue.longitude).toFixed(3)}°E`
                        : 'Municipal Zone'}
                    </div>
                    <div className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold tracking-wider rounded-lg">
                      RESOLVED
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm text-teal-600">
              <Camera className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Resolution Pipeline Active
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              All <strong className="text-slate-900 font-bold">{issues.length}</strong> reported issues in the database are currently tracked in municipal workflows. As field workers complete repairs and city managers approve before/after verification photos, verified resolution showcases will appear here automatically.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>Live Database Sync — Ready for Verified Proofs</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResolutionStories;
