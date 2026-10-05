import React from 'react';
import { reportCategories } from '../../../data/public/reportCategories';

const ReportCategories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            What You Can Report
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform categorizes issues to ensure they reach the correct authorities quickly.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-blue-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReportCategories;
