import React from 'react';

const emptyPageTemplate = (title) => (
  <div className="p-8 max-w-7xl mx-auto">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center text-gray-500 flex flex-col items-center justify-center">
      <div className="text-5xl mb-4 opacity-50">🛠️</div>
      <h2 className="text-xl font-medium text-gray-900 mb-2">Under Construction</h2>
      <p>This module is API-ready and currently being implemented in the frontend.</p>
    </div>
  </div>
);

export const SuperAdminUsers = () => emptyPageTemplate('User Management');
export const SuperAdminIssues = () => emptyPageTemplate('Platform Issues');
export const SuperAdminAssignments = () => emptyPageTemplate('Assignments Oversights');
export const SuperAdminVerifications = () => emptyPageTemplate('Verifications Oversights');
export const SuperAdminPayments = () => emptyPageTemplate('Payments Oversights');
export const SuperAdminAppraisals = () => emptyPageTemplate('Appraisal System');

export const SuperAdminAuditLogs = () => emptyPageTemplate('Audit Logs');
