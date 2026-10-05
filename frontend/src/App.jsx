import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Public pages
import { PublicRoutes } from './routes/publicRoutes';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import NotFound from './pages/public/NotFound';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import MyIssues from './pages/citizen/MyIssues';
import IssueDetails from './pages/citizen/IssueDetails';
import CitizenLayout from './components/citizen/CitizenLayout';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminIssueDetails from './pages/admin/AdminIssueDetails';

// Worker Pages
import WorkerLayout from './components/worker/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerAssignments from './pages/worker/WorkerAssignments';
import WorkerAssignmentDetails from './pages/worker/WorkerAssignmentDetails';
import BeforeWorkVerification from './pages/worker/BeforeWorkVerification';
import WorkerAfterWorkVerification from './pages/worker/WorkerAfterWorkVerification';
import WorkerWorkExecution from './pages/worker/WorkerWorkExecution';
import ManagerLayout from './components/manager/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerIssues from './pages/manager/ManagerIssues';
import ManagerIssueDetails from './pages/manager/ManagerIssueDetails';
import ManagerAssignments from './pages/manager/ManagerAssignments';
import ManagerAssignmentDetails from './pages/manager/ManagerAssignmentDetails';
import ManagerWorkers from './pages/manager/ManagerWorkers';
import ManagerWorkerDetails from './pages/manager/ManagerWorkerDetails';
import BeforeWorkVerifications from './pages/manager/BeforeWorkVerifications';
import BeforeWorkVerificationDetails from './pages/manager/BeforeWorkVerificationDetails';
import ManagerAfterWorkVerifications from './pages/manager/ManagerAfterWorkVerifications';
import ManagerAfterWorkVerificationDetails from './pages/manager/ManagerAfterWorkVerificationDetails';

// Dashboard placeholders
import DashboardPlaceholder from './pages/DashboardPlaceholder';

// Super Admin Pages
import SuperAdminLayout from './components/superAdmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import SuperAdminUsers from './pages/superAdmin/SuperAdminUsers';
import SuperAdminIssues from './pages/superAdmin/SuperAdminIssues';
import SuperAdminAssignments from './pages/superAdmin/SuperAdminAssignments';
import SuperAdminVerifications from './pages/superAdmin/SuperAdminVerifications';
import SuperAdminPayments from './pages/superAdmin/SuperAdminPayments';
import SuperAdminAuditLogs from './pages/superAdmin/SuperAdminAuditLogs';
import SuperAdminAnalytics from './pages/superAdmin/SuperAdminAnalytics';
import SuperAdminNotifications from './pages/superAdmin/SuperAdminNotifications';
import SuperAdminAppraisals from './pages/superAdmin/SuperAdminAppraisals';
import SuperAdminAppraisalDetails from './pages/superAdmin/SuperAdminAppraisalDetails';
import SuperAdminSettings from './pages/superAdmin/SuperAdminSettings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {PublicRoutes}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            
            <Route element={<RoleRoute allowedRoles={['CITIZEN']} />}>
              <Route path="/citizen" element={<CitizenLayout />}>
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="report-issue" element={<ReportIssue />} />
                <Route path="issues" element={<MyIssues />} />
                <Route path="issues/:id" element={<IssueDetails />} />
              </Route>
            </Route>
            
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="issues" element={<AdminIssues />} />
                <Route path="issues/:id" element={<AdminIssueDetails />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['MANAGER']} />}>
              <Route path="/manager" element={<ManagerLayout />}>
                <Route index element={<ManagerDashboard />} />
                <Route path="issues" element={<ManagerIssues />} />
                <Route path="issues/:id" element={<ManagerIssueDetails />} />
                <Route path="workers" element={<ManagerWorkers />} />
                <Route path="workers/:id" element={<ManagerWorkerDetails />} />
                <Route path="assignments" element={<ManagerAssignments />} />
                <Route path="assignments/:id" element={<ManagerAssignmentDetails />} />
                <Route path="verifications/before" element={<BeforeWorkVerifications />} />
                <Route path="verifications/before/:id" element={<BeforeWorkVerificationDetails />} />
                <Route path="verifications/after" element={<ManagerAfterWorkVerifications />} />
                <Route path="verifications/after/:id" element={<ManagerAfterWorkVerificationDetails />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['WORKER']} />}>
              <Route path="/worker" element={<WorkerLayout />}>
                <Route index element={<WorkerDashboard />} />
                <Route path="assignments" element={<WorkerAssignments />} />
                <Route path="assignments/:id" element={<WorkerAssignmentDetails />} />
                <Route path="assignments/:id/before-verification" element={<BeforeWorkVerification />} />
                <Route path="assignments/:id/after-verification" element={<WorkerAfterWorkVerification />} />
                <Route path="assignments/:id/work" element={<WorkerWorkExecution />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="/super-admin" element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminDashboard />} />
                <Route path="users" element={<SuperAdminUsers />} />
                <Route path="issues" element={<SuperAdminIssues />} />
                <Route path="assignments" element={<SuperAdminAssignments />} />
                <Route path="verifications" element={<SuperAdminVerifications />} />
                <Route path="payments" element={<SuperAdminPayments />} />
                <Route path="appraisals" element={<SuperAdminAppraisals />} />
                <Route path="appraisals/:id" element={<SuperAdminAppraisalDetails />} />
                <Route path="analytics" element={<SuperAdminAnalytics />} />
                <Route path="notifications" element={<SuperAdminNotifications />} />
                <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
                <Route path="settings" element={<SuperAdminSettings />} />
              </Route>
            </Route>

          </Route>
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
