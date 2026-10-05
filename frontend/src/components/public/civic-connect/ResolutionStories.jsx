import React from 'react';
import { Image as ImageIcon, Camera } from 'lucide-react';

const ResolutionStories = () => {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Resolution Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See examples of civic issues moving from problem to verified resolution.
          </p>
        </div>

        {/* Empty state container for future API data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-[400px]">
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-6 border-b border-gray-200">
                <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
                <span className="text-sm font-medium">Public-safe media will appear here</span>
              </div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs font-medium text-gray-500">
                    <Camera className="h-4 w-4 mr-1" />
                    Before & After
                  </div>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                    RESOLVED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            Verified resolution stories will appear here when available.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResolutionStories;
