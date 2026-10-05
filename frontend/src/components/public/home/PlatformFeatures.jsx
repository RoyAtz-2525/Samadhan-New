import React from 'react';
import { Map, Camera, FileCheck, Users, Eye, TrendingUp, CheckSquare, Activity, Bell, ListTree } from 'lucide-react';

const features = [
  { name: 'Location-based reporting', icon: Map },
  { name: 'Photo/video evidence', icon: Camera },
  { name: 'Structured issue review', icon: FileCheck },
  { name: 'Worker allocation', icon: Users },
  { name: 'Before-work verification', icon: Eye },
  { name: 'Work progress tracking', icon: TrendingUp },
  { name: 'After-work verification', icon: CheckSquare },
  { name: 'Status tracking', icon: Activity },
  { name: 'Notifications', icon: Bell },
  { name: 'Transparent workflow', icon: ListTree },
];

const PlatformFeatures = () => {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Platform Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed to manage civic infrastructure efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <Icon className="h-8 w-8 text-blue-600 mb-3" />
                <span className="text-sm font-medium text-gray-800">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlatformFeatures;
