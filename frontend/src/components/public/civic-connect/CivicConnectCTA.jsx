import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const CivicConnectCTA = () => {
  const { user } = useAuth();
  return (
    <section className="bg-gradient-to-br from-teal-500 to-teal-700 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaC0ydi0yMGgtMjB2LTJoMjB2LTIwaDJ2MjBoMjB2MmgtMjB6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
          Ready to improve your neighborhood?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to={!user ? "/register" : user.role?.name === 'CITIZEN' ? "/citizen/report-issue" : user.role?.name === 'ADMIN' ? "/admin" : user.role?.name === 'MANAGER' ? "/manager" : user.role?.name === 'WORKER' ? "/worker" : user.role?.name === 'SUPER_ADMIN' ? "/super-admin" : "/"} state={!user ? { from: "/citizen/report-issue" } : undefined} className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold rounded-xl text-teal-700 bg-white hover:bg-slate-50 transition-all shadow-xl shadow-teal-900/20">
            Report an Issue
          </Link>
          <Link to="/how-it-works" className="inline-flex justify-center items-center px-8 py-4 border border-white/30 text-lg font-bold rounded-xl text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
            Learn How It Works
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CivicConnectCTA;