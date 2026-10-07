import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Building,
  Users,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      const user = await login(email, password);

      if (from && user.role.name === "CITIZEN") {
        navigate(from);
        return;
      }

      switch (user.role.name) {
        case "CITIZEN":
          navigate("/");
          break;

        case "ADMIN":
          navigate("/admin");
          break;

        case "MANAGER":
          navigate("/manager");
          break;

        case "WORKER":
          navigate("/worker");
          break;

        case "SUPER_ADMIN":
          navigate("/super-admin");
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Invalid email or password. Please try again.",
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

          {/* Subtle pattern */}
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

            {/* Main content */}
            <div className="max-w-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <ShieldCheck size={14} className="text-[#0F9D8A]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  Civic Issue Resolution
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-5xl">
                Make Your City
                <br />
                <span className="text-[#0F9D8A]">Better Together</span>
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300 xl:text-base">
                Report civic issues, track progress, and help create stronger
                communities.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <MapPin size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Report</p>

                  <p className="text-xs text-slate-400">
                    Pinpoint issues easily
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Building size={17} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Track</p>

                  <p className="text-xs text-slate-400">
                    Follow resolution progress
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Users size={17} className="text-[#3B82F6]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Resolve</p>

                  <p className="text-xs text-slate-400">
                    Community-driven action
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
            RIGHT LOGIN PANEL
        ===================================================== */}
        <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
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

            {/* Login Card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-6">
              {/* Header */}
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F5]">
                  <ShieldCheck size={20} className="text-[#0F9D8A]" />
                </div>

                <h2 className="text-xl font-bold tracking-tight text-[#0F172A] sm:text-2xl">
                  Welcome Back
                </h2>

                <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                  Sign in to continue to SAMADHAN.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-[#DC2626]">
                  <span className="mt-0.5">⚠</span>

                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-4">
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
                      placeholder="••••••••"
                      className={`${inputClass} pr-10`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#0F172A] focus:outline-none"
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
                  className="group mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#12345B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Trust message */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#94A3B8]">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                Secure access to your SAMADHAN account
              </div>

              {/* Register */}
              <div className="mt-4 border-t border-[#E2E8F0] pt-4 text-center">
                <p className="text-xs text-[#64748B] sm:text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    state={{ from }}
                    className="font-semibold text-[#0F9D8A] transition-colors hover:text-[#0B7A6A]"
                  >
                    Create an account
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

export default Login;
