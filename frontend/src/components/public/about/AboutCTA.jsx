import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const AboutCTA = () => {
  const { user } = useAuth();
  
  const getReportLink = () => {
    if (!user) return "/register";
    switch(user.role?.name) {
      case 'CITIZEN': return "/citizen/report-issue";
      case 'ADMIN': return "/admin";
      case 'MANAGER': return "/manager";
      case 'WORKER': return "/worker";
      case 'SUPER_ADMIN': return "/super-admin";
      default: return "/";
    }
  };

  return (
    <section className="bg-[#F5F7FA] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-10 shadow-sm border border-[#E2E8F0] sm:p-16">
          <h2 className="mb-6 text-3xl font-extrabold text-[#0B1F3A] sm:text-4xl">
            Have a civic issue to report?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[#64748B]">
            Join thousands of citizens and authorities working together to create cleaner, safer, and more connected communities.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              to={getReportLink()} 
              state={!user ? { from: "/citizen/report-issue" } : undefined} 
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-4 text-base font-bold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/25 sm:w-auto"
            >
              Report an Issue
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              to="/how-it-works" 
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#F5F7FA] px-8 py-4 text-base font-bold text-[#0B1F3A] transition-colors hover:bg-[#E2E8F0] sm:w-auto"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutCTA;
