import api from './api';

export const getAdminDashboardMetrics = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminIssues = async (status = 'ALL') => {
  const response = await api.get(`/admin/issues?status=${status}`);
  return response.data;
};

export const getAdminIssueDetails = async (id) => {
  const response = await api.get(`/admin/issues/${id}`);
  return response.data;
};

export const reviewIssue = async (id, action, reason) => {
  const response = await api.patch(`/admin/issues/${id}/review`, { action, reason });
  return response.data;
};

export const updateIssuePriority = async (id, priority) => {
  const response = await api.patch(`/admin/issues/${id}/priority`, { priority });
  return response.data;
};
