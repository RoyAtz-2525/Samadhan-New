import React from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';

const ResolutionStories = () => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Resolution Stories
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            See actual examples of civic issues moving from problem to verified resolution.
          </p>
        </div>

        {/* Empty state container for future API data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col h-[420px] hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-b border-slate-100 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-50"></div>
                <ImageIcon className="h-12 w-12 mb-4 opacity-30 relative z-10" />
                <span className="text-sm font-bold text-slate-400 relative z-10">Public-safe media pending</span>
              </div>
              <div className="p-8">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-8"></div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Camera className="h-4 w-4 mr-2" />
                    Before & After
                  </div>
                  <div className="px-3 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold tracking-wider rounded-lg">
                    RESOLVED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResolutionStories;