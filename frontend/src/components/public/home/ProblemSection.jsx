import React from 'react';
import { reportCategories } from '../../../data/public/reportCategories';

const ProblemSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
          The Problem with Civic Issues
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Civic problems are easy to notice, but often difficult to track from report to resolution.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {reportCategories.slice(0, 6).map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="flex flex-col items-center bg-gray-50 px-6 py-4 rounded-lg border border-gray-100 shadow-sm w-40">
                <Icon className="h-8 w-8 text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-800 text-center">{cat.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
