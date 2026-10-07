import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Map, Users, ArrowRight } from 'lucide-react';

const CivicConnectHero = () => {
  const { user } = useAuth();
  return (
    <section className="bg-[#0B1F3A] text-white py-16 md:py-24 overflow-hidden relative">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
              <Map className="h-8 w-8 text-teal-400" />
            </div>
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            See Your Community.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
              Follow the Change.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
            Explore public civic activity, understand issue progress, and see how reported problems move toward resolution in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined} className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-xl text-[#0B1F3A] bg-teal-400 hover:bg-teal-300 transition-colors shadow-lg shadow-teal-500/30">
              Report an Issue
            </Link>
            <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-slate-600 text-base font-bold rounded-xl text-white bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 backdrop-blur-sm transition-all">
              How It Works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
    </section>
  );
};

export default CivicConnectHero;