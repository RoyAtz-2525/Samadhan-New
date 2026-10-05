import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MapPin, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return null;
    switch (user.role?.name) {
      case "CITIZEN":
        return "/citizen/dashboard";
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/manager";
      case "WORKER":
        return "/worker";
      case "SUPER_ADMIN":
        return "/super-admin";
      default:
        return "/";
    }
  };

  const dashboardRoute = getDashboardRoute();

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center font-sans p-6">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#0B1F3A] rounded-full opacity-5 blur-[100px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-[#0F9D8A] rounded-full opacity-5 blur-[100px]"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#0B1F3A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center">
        {/* Civic Illustration / Icon */}
        <div className="relative mb-8">
          <div className="w-12 h-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center border border-[#E2E8F0] relative z-10 animate-in zoom-in duration-500">
            <MapPin className="w-6 h-6 text-[#0F9D8A]" strokeWidth={1.5} />
          </div>

          {/* Disconnected Path line */}
          <svg
            className="absolute top-1/2 left-full w-24 h-4 -translate-y-1/2 text-slate-300"
            viewBox="0 0 100 20"
            fill="none"
          >
            <path
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
              d="M0 10 L80 10"
            />
            <circle cx="90" cy="10" r="4" fill="currentColor" />
          </svg>
          <svg
            className="absolute top-1/2 right-full w-24 h-4 -translate-y-1/2 text-slate-300"
            viewBox="0 0 100 20"
            fill="none"
          >
            <path
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
              d="M100 10 L20 10"
            />
            <circle cx="10" cy="10" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl md:text-9xl font-black text-[#0B1F3A] tracking-tighter mb-4 opacity-90">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-4">
          Location Not Found
        </h2>
        <p className="text-[#64748B] text-lg max-w-md mx-auto mb-10 leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or you
          might not have permission to view it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2 text-[#64748B]" />
            Go Back
          </button>

          {dashboardRoute ? (
            <Link
              to={dashboardRoute}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] text-white rounded-xl font-semibold hover:bg-[#12345B] transition-colors shadow-lg shadow-[#0B1F3A]/20 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-[#0B1F3A] text-white rounded-xl font-semibold hover:bg-[#12345B] transition-colors shadow-lg shadow-[#0B1F3A]/20 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          )}
        </div>
      </div>

      {/* Footer Logo */}
      <div className="absolute bottom-8 z-10">
        <Link to="/">
          <img
            src="/logo.png"
            alt="SAMADHAN Logo"
            className="h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
          />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
