import React, { useState, useEffect } from "react";
import superAdminService from "../../services/superAdmin/superAdminService";
import {
  Settings,
  Server,
  MapPin,
  Database,
  Bell,
  Tag,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getSettings();
      setSettings(data);
      setError(null);
    } catch {
      console.error("Failed to fetch platform settings.");
      setError("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B1F3A]"></div>
        <p className="mt-4 text-[#64748B] font-medium">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center max-w-lg mx-auto mt-10">
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl border border-red-200 inline-flex items-center mb-6">
          <AlertTriangle className="mr-2 h-5 w-5" />
          {error}
        </div>
        <button
          onClick={fetchSettings}
          className="px-6 py-2.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-colors shadow-sm"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center">
          <Settings className="w-7 h-7 mr-3 text-[#0B1F3A]" />
          Platform Configuration
        </h1>
        <p className="text-sm text-[#64748B] mt-2 ml-10 max-w-2xl">
          View current deployment and platform configuration. These settings are
          read-only and configured at the deployment level.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center">
            <Server className="w-5 h-5 text-[#3B82F6] mr-2" />
            <h2 className="text-lg font-bold text-[#0F172A]">System Status</h2>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#E2E8F0]/50">
              <span className="text-sm font-medium text-[#64748B]">
                Environment
              </span>
              <span className="px-3 py-1 text-xs font-bold bg-[#F1F5F9] text-[#475569] rounded-lg tracking-wider border border-[#E2E8F0]">
                {settings?.system?.environment?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#E2E8F0]/50">
              <span className="text-sm font-medium text-[#64748B]">
                Database Connection
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold tracking-wider rounded-lg border ${
                  settings?.system?.dbStatus === "Connected"
                    ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                    : "bg-red-50 text-[#DC2626] border-red-200"
                }`}
              >
                {settings?.system?.dbStatus}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-[#64748B]">
                API Status
              </span>
              <span className="px-3 py-1 text-xs font-bold bg-blue-50 text-[#3B82F6] border border-blue-200 rounded-lg tracking-wider">
                {settings?.system?.apiStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center">
            <MapPin className="w-5 h-5 text-[#0F9D8A] mr-2" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              Verification Rules
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="bg-[#F5F7FA] rounded-xl p-5 border border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-sm font-semibold text-[#0F172A]">
                  Worker Proximity Requirement
                </span>
                <div className="flex items-center text-lg font-black text-[#0F9D8A]">
                  {settings?.verificationSettings?.beforeWorkMaxDistanceKm *
                    1000}{" "}
                  <span className="text-sm font-medium text-[#64748B] ml-1">
                    meters
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-4 pt-4 border-t border-[#E2E8F0]">
                Configured via{" "}
                <code className="bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[#0F172A]">
                  BEFORE_WORK_MAX_DISTANCE_KM
                </code>{" "}
                in server constants.
              </p>
            </div>
          </div>
        </div>

        {/* Issue Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center">
            <Database className="w-5 h-5 text-[#8B5CF6] mr-2" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              Issue Configuration
            </h2>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Priority Levels
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings?.issueConfiguration?.priorities?.map((priority) => {
                  let colorClass = "bg-gray-50 text-[#64748B] border-[#E2E8F0]";
                  if (priority === "HIGH" || priority === "CRITICAL")
                    colorClass = "bg-red-50 text-[#DC2626] border-red-200";
                  if (priority === "MEDIUM")
                    colorClass =
                      "bg-orange-50 text-[#F59E0B] border-orange-200";
                  if (priority === "LOW")
                    colorClass = "bg-blue-50 text-[#3B82F6] border-blue-200";

                  return (
                    <span
                      key={priority}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border tracking-wider ${colorClass}`}
                    >
                      {priority}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center">
                <Tag className="w-4 h-4 mr-1.5" />
                Categories
              </h3>
              <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden">
                <ul className="divide-y divide-[#E2E8F0] max-h-60 overflow-y-auto custom-scrollbar">
                  {settings?.issueConfiguration?.categories?.map((category) => (
                    <li
                      key={category.id}
                      className="p-3.5 hover:bg-white transition-colors flex flex-col"
                    >
                      <span className="font-semibold text-[#0F172A] text-sm">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="text-xs text-[#64748B] mt-1 line-clamp-2">
                          {category.description}
                        </span>
                      )}
                    </li>
                  ))}
                  {(!settings?.issueConfiguration?.categories ||
                    settings.issueConfiguration.categories.length === 0) && (
                    <li className="p-6 text-sm text-[#64748B] text-center italic">
                      No categories configured
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center">
            <Bell className="w-5 h-5 text-[#F59E0B] mr-2" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              Notification Events
            </h2>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-3">
              {settings?.notificationSettings?.types?.map((type) => (
                <div
                  key={type}
                  className="flex items-center px-3.5 py-2 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]"
                >
                  <CheckCircle className="w-4 h-4 text-[#0F9D8A] mr-2" />
                  <span className="text-sm font-semibold text-[#475569] tracking-wide">
                    {type}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#64748B] mt-6 pt-4 border-t border-[#E2E8F0]">
              System notification events are dynamically defined by Prisma
              schema enums.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
