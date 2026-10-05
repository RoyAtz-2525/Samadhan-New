import React from 'react';
import { User, Shield, Briefcase, HardHat, ArrowRight } from 'lucide-react';

const WhatIsSamadhan = () => {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
          What is SAMADHAN?
        </h2>
        <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-16">
          SAMADHAN provides one structured workflow from reporting to verified resolution, bringing all stakeholders onto a single platform.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-4 lg:space-x-8">
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Citizen</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Reports issue</p>
          </div>
          
          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />
          
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Admin</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Reviews & Approves</p>
          </div>

          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />

          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Manager</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Allocates & Verifies</p>
          </div>

          <ArrowRight className="hidden md:block h-8 w-8 text-blue-300 flex-shrink-0" />

          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="bg-white text-blue-600 p-4 rounded-full mb-4 shadow-lg">
              <HardHat className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Worker</h3>
            <p className="text-sm text-blue-200 mt-2 max-w-[150px]">Executes Work</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSamadhan;
