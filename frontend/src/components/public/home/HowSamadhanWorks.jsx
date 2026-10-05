import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { workflowSteps } from '../../../data/public/workflowSteps';

const HowSamadhanWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            How SAMADHAN Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A simplified, transparent workflow ensuring accountability at every step.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col">
                <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {index + 1}
                </div>
                <Icon className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 flex-grow">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/how-it-works" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
            Explore the Full Workflow <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowSamadhanWorks;
