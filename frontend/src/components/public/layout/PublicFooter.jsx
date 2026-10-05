import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, ShieldCheck } from "lucide-react";

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E2E8F0] bg-[#0B1F3A] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="inline-flex rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]"
            >
              <img
                src="/logo.png"
                alt="Samadhan Logo"
                className="h-11 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Connecting citizens and civic authorities to report, manage, and
              resolve infrastructure issues — creating better, cleaner, and more
              responsive communities.
            </p>

            {/* Trust Badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
              <ShieldCheck size={17} className="text-[#0F9D8A]" />
              <span className="text-xs font-medium text-slate-300">
                Built for transparent civic engagement
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/"
                  className="group inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Home
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  About
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/how-it-works"
                  className="group inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  How It Works
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/civic-connect"
                  className="group inline-flex items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Civic Connect
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Account
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Stay Connected
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Mail size={16} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Support</p>
                  <p className="mt-0.5 text-sm text-slate-200">Civic Support</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <MapPin size={16} className="text-[#0F9D8A]" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Service</p>
                  <p className="mt-0.5 text-sm text-slate-200">
                    Your Community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Strip */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                See an issue in your community?
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Report it and help make your city better.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#0F9D8A] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0D8B7A] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]"
            >
              Report an Issue
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-slate-400">
            © {currentYear} SAMADHAN. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              to="/privacy"
              className="text-xs text-slate-400 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="text-xs text-slate-400 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
