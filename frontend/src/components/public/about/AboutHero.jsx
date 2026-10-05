import React from 'react';

const AboutHero = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Building a More <span className="text-blue-600">Connected</span> Civic Experience
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            SAMADHAN brings citizens, administrators, managers, and field workers into one structured platform for reporting, coordinating, and resolving civic issues.
          </p>
        </div>
      </div>
      
      {/* Subtle civic visual background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-48 -right-24 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>
    </section>
  );
};

export default AboutHero;
