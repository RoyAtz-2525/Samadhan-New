import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Users,
  User,
  Phone,
  CheckCircle2,
  Wrench,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CITIZEN",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { registerCitizen, registerWorker } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      if (formData.role === "CITIZEN") {
        await registerCitizen(formData);
      } else {
        await registerWorker(formData);
      }

      navigate("/login", { state: { from } });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed. Please check your information and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-10 pr-3 text-sm text-[#0F172A] outline-none transition-all duration-200 placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/15 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="h-screen overflow-hidden bg-[#F5F7FA] font-sans">
      <div className="flex h-full w-full">
        {/* =====================================================
            LEFT BRAND PANEL
        ===================================================== */}
        <div className="relative hidden h-full w-[38%] overflow-hidden bg-[#0B1F3A] lg:flex xl:w-[40%]">
          {/* Background decoration */}
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#0F9D8A]/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#3B82F6]/10 blur-3xl" />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 xl:p-10">
            {/* Logo */}
            <div>
              <Link
                to="/"
                className="inline-flex rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]"
              >
                <img
                  src="/logo.png"
                  alt="SAMADHAN Logo"
                  className="h-12 w-auto brightness-0 invert"
                />
              </Link>
            </div>

            {/* Main Brand Content */}
            <div className="max-w-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <ShieldCheck size={14} className="text-[#0F9D8A]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  Civic Issue Resolution
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-5xl">
                Join Your
                <br />
                <span className="text-[#0F9D8A]">Community</span>
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300 xl:text-base">
                Create an account to report civic issues, track resolutions, or
                contribute as a civic worker.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <CheckCircle2 size={17} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Verified Actions
                  </p>

                  <p className="text-xs text-slate-400">
                    Secure and transparent process
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Users size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Civic Network
                  </p>

                  <p className="text-xs text-slate-400">
                    Connect with local administration
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-[10px] text-slate-500">
              © {new Date().getFullYear()} SAMADHAN Platform
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT REGISTER PANEL
        ===================================================== */}
        <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg">
            {/* Mobile Logo */}
            <div className="mb-3 flex justify-center lg:hidden">
              <Link to="/">
                <img
                  src="/logo.png"
                  alt="SAMADHAN Logo"
                  className="h-11 w-auto"
                />
              </Link>
            </div>

            {/* Register Card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-6">
              {/* Header */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
                  Create Your Account
                </h2>

                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                  Join SAMADHAN and help make your community better.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-[#DC2626]">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Role Selection */}
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold text-[#0F172A]">
                    I want to register as
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Citizen */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          role: "CITIZEN",
                        })
                      }
                      disabled={isLoading}
                      className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                        formData.role === "CITIZEN"
                          ? "border-[#0B1F3A] bg-[#F5F7FA] shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          formData.role === "CITIZEN"
                            ? "bg-[#0B1F3A] text-white"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        <User size={17} />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${
                            formData.role === "CITIZEN"
                              ? "text-[#0B1F3A]"
                              : "text-[#334155]"
                          }`}
                        >
                          Citizen
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#64748B]">
                          Report civic issues
                        </p>
                      </div>
                    </button>

                    {/* Worker */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          role: "WORKER",
                        })
                      }
                      disabled={isLoading}
                      className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                        formData.role === "WORKER"
                          ? "border-[#0F9D8A] bg-[#EAF7F5]/50 shadow-sm"
                          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          formData.role === "WORKER"
                            ? "bg-[#0F9D8A] text-white"
                            : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        <Wrench size={17} />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${
                            formData.role === "WORKER"
                              ? "text-[#0F9D8A]"
                              : "text-[#334155]"
                          }`}
                        >
                          Worker
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#64748B]">
                          Resolve assignments
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0F172A]">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />

                      <input
                        type="text"
                        placeholder="John Doe"
                        className={inputClass}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0F172A]">
                      Phone{" "}
                      <span className="font-normal text-[#94A3B8]">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                      />

                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className={inputClass}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[#0F172A]">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    />

                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={inputClass}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[#0F172A]">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      className={`${inputClass} pr-10`}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#0F172A]"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#12345B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-4 border-t border-[#E2E8F0] pt-4 text-center">
                <p className="text-xs text-[#64748B] sm:text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ from }}
                    className="font-semibold text-[#0F9D8A] transition-colors hover:text-[#0B7A6A]"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Mobile copyright */}
            <p className="mt-3 text-center text-[10px] text-[#94A3B8] lg:hidden">
              © {new Date().getFullYear()} SAMADHAN Platform. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
