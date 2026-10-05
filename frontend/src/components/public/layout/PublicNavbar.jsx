import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (!user) return "/";

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Civic Connect", path: "/civic-connect" },
  ];

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-[100] w-full border-b border-[#E2E8F0] bg-white/95 shadow-[0_2px_14px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center rounded-lg outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              >
                <img
                  src="/logo.png"
                  alt="Samadhan Logo"
                  className="h-10 w-auto object-contain sm:h-11"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    [
                      "relative px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      "rounded-lg outline-none",
                      "focus-visible:ring-2 focus-visible:ring-[#3B82F6]",
                      isActive
                        ? "text-[#0B1F3A]"
                        : "text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#0B1F3A]",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.name}

                      <span
                        className={[
                          "absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-[#0F9D8A] transition-all duration-200",
                          isActive ? "w-5" : "w-0",
                        ].join(" ")}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-3 md:flex">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#64748B] transition-colors duration-200 hover:bg-[#F5F7FA] hover:text-[#0B1F3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    state={{ from: "/citizen/report-issue" }}
                    className="group inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#12345B] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                  >
                    Report an Issue
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                    className="flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 transition-all duration-200 hover:border-[#CBD5E1] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF7F5] text-[#0F9D8A]">
                      <User size={16} />
                    </div>

                    <span className="max-w-[130px] truncate text-sm font-semibold text-[#0F172A]">
                      {user.name || "Account"}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`text-[#64748B] transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
                      {/* Account Header */}
                      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7F5] text-[#0F9D8A]">
                            <User size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0F172A]">
                              {user.name || "Account"}
                            </p>

                            <p className="truncate text-xs text-[#64748B]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <span className="mt-3 inline-flex rounded-md bg-[#EAF7F5] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0F9D8A]">
                          {user.role?.name}
                        </span>
                      </div>

                      {/* Menu */}
                      <div className="p-2">
                        <Link
                          to={getDashboardRoute()}
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F5F7FA] hover:text-[#0B1F3A]"
                        >
                          <LayoutDashboard
                            size={17}
                            className="text-[#64748B] group-hover:text-[#0B1F3A]"
                          />
                          Dashboard
                        </Link>

                        {user.role?.name === "CITIZEN" && (
                          <Link
                            to="/citizen/issues"
                            onClick={() => setIsDropdownOpen(false)}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F5F7FA] hover:text-[#0B1F3A]"
                          >
                            <ClipboardList
                              size={17}
                              className="text-[#64748B] group-hover:text-[#0B1F3A]"
                            />
                            My Issues
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-[#E2E8F0] p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50"
                        >
                          <LogOut size={17} className="text-[#DC2626]" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={
                  isMobileMenuOpen ? "Close main menu" : "Open main menu"
                }
                aria-expanded={isMobileMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0B1F3A] transition-colors duration-200 hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              >
                {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-[#E2E8F0] bg-white md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      [
                        "flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-200",
                        isActive
                          ? "bg-[#EAF7F5] text-[#0B1F3A]"
                          : "text-[#64748B] hover:bg-[#F5F7FA] hover:text-[#0B1F3A]",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`mr-3 h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-[#0F9D8A]" : "bg-[#CBD5E1]"
                          }`}
                        />
                        {link.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="my-4 h-px bg-[#E2E8F0]" />

              {/* Mobile Auth */}
              {!user ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm font-semibold text-[#0B1F3A] transition-colors hover:bg-[#F5F7FA]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    state={{ from: "/citizen/report-issue" }}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#12345B]"
                  >
                    Report an Issue
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Mobile User Info */}
                  <div className="mb-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF7F5] text-[#0F9D8A]">
                        <User size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#0F172A]">
                          {user.name || "Account"}
                        </p>

                        <p className="truncate text-xs text-[#64748B]">
                          {user.email}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#0F9D8A]">
                          {user.role?.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={getDashboardRoute()}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F5F7FA] hover:text-[#0B1F3A]"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    {user.role?.name === "CITIZEN" && (
                      <Link
                        to="/citizen/issues"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F5F7FA] hover:text-[#0B1F3A]"
                      >
                        <ClipboardList size={18} />
                        My Issues
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#DC2626] transition-colors hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default PublicNavbar;
