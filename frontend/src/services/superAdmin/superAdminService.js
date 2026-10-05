import api from '../api';

const superAdminService = {
  getOverview: async () => {
    const response = await api.get('/super-admin/overview');
    return response.data;
  },
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/users?${params}`);
    return response.data;
  },
  getIssues: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/issues?${params}`);
    return response.data;
  },
  getIssueDetail: async (id) => {
    const response = await api.get(`/super-admin/issues/${id}`);
    return response.data;
  },
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/assignments?${params}`);
    return response.data;
  },
  getVerifications: async (type = 'all') => {
    const response = await api.get(`/super-admin/verifications?type=${type}`);
    return response.data;
  },
  getPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/payments?${params}`);
    return response.data;
  },
  getAuditLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/audit-logs?${params}`);
    return response.data;
  },
  getAnalytics: async (range = '30d') => {
    const response = await api.get(`/super-admin/analytics?range=${range}`);
    return response.data;
  },
  getNotifications: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/notifications?${params}`);
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/super-admin/settings');
    return response.data;
  },
  getAppraisals: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/super-admin/appraisals?${params}`);
    return response.data;
  },
  getAppraisalDetail: async (id) => {
    const response = await api.get(`/super-admin/appraisals/${id}`);
    return response.data;
  }
};

export default superAdminService;
