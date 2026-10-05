import React from 'react';
import { Search, FileText, CheckCircle, MapPin, Wrench } from 'lucide-react';

const WhySamadhan = () => {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Why SAMADHAN?
          </h2>
          <p className="text-xl text-gray-600">
            Identifying a civic problem is only the beginning. The real challenge is taking it from report to verified resolution.
          </p>
        </div>

        <div className="relative">
          {/* Journey Path */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-blue-300 to-green-300 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {[
              { icon: MapPin, title: "Issue Appears", desc: "A civic issue surfaces in the community." },
              { icon: Search, title: "Citizen Notices", desc: "A citizen observes and reports the issue." },
              { icon: FileText, title: "Review", desc: "Authorities validate the reported problem." },
              { icon: Wrench, title: "Execution", desc: "Field workers execute the coordinated fix." },
              { icon: CheckCircle, title: "Resolution", desc: "The result is verified and marked complete." }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="bg-white border-4 border-blue-50 h-16 w-16 rounded-full flex items-center justify-center shadow-md mb-4 relative z-10 text-blue-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySamadhan;
