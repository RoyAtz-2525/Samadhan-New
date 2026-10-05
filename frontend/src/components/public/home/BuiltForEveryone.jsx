import React from 'react';
import { Users, Shield, Settings, HardHat } from 'lucide-react';

const BuiltForEveryone = () => {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-4">
            Built for Everyone
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A cohesive ecosystem supporting all roles in the civic infrastructure lifecycle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors h-full">
            <Users className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Citizens</h3>
            <p className="text-gray-400 text-sm">Report and track civic issues directly from your mobile device.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-colors h-full">
            <Shield className="h-10 w-10 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Administrators</h3>
            <p className="text-gray-400 text-sm">Review and verify reported issues to prevent duplicates and spam.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-colors h-full">
            <Settings className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Managers</h3>
            <p className="text-gray-400 text-sm">Coordinate assignments, oversee workers, and verify resolutions.</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors h-full">
            <HardHat className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Field Workers</h3>
            <p className="text-gray-400 text-sm">Execute and document civic work with transparent proof of progress.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuiltForEveryone;
