import api from './api';

const getDashboardMetrics = async () => {
  const response = await api.get('/manager/dashboard');
  return response.data;
};

const getApprovedIssues = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/manager/issues/approved?${params}`);
  return response.data;
};

const getIssueDetails = async (id) => {
  const response = await api.get(`/manager/issues/${id}`);
  return response.data;
};

const getWorkers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/manager/workers?${params}`);
  return response.data;
};

const getWorkerDetails = async (id) => {
  const response = await api.get(`/manager/workers/${id}`);
  return response.data;
};

const getWorkerPerformance = async (id) => {
  const response = await api.get(`/manager/workers/${id}/performance`);
  return response.data;
};

// Appraisal Methods
const createAppraisal = async (workerId, payload) => {
  const response = await api.post(`/manager/workers/${workerId}/appraisals`, payload);
  return response.data;
};

const getAppraisals = async (workerId) => {
  const response = await api.get(`/manager/workers/${workerId}/appraisals`);
  return response.data;
};

const getAppraisalDetails = async (appraisalId) => {
  const response = await api.get(`/manager/appraisals/${appraisalId}`);
  return response.data;
};

const updateAppraisal = async (appraisalId, payload) => {
  const response = await api.patch(`/manager/appraisals/${appraisalId}`, payload);
  return response.data;
};

const submitAppraisal = async (appraisalId) => {
  const response = await api.post(`/manager/appraisals/${appraisalId}/submit`);
  return response.data;
};

const createAssignment = async (data) => {
  const response = await api.post('/manager/assignments', data);
  return response.data;
};

const getAssignments = async () => {
  const response = await api.get('/manager/assignments');
  return response.data;
};

const getAssignmentDetails = async (id) => {
  const response = await api.get(`/manager/assignments/${id}`);
  return response.data;
};

const getBeforeWorkVerifications = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/manager/verifications/before?${params}`);
  return response.data;
};

const getBeforeWorkVerificationDetails = async (id) => {
  const response = await api.get(`/manager/verifications/before/${id}`);
  return response.data;
};

const reviewBeforeWorkVerification = async (id, payload) => {
  const response = await api.patch(`/manager/verifications/before/${id}/review`, payload);
  return response.data;
};

const getAfterWorkVerifications = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/manager/verifications/after?${params}`);
  return response.data;
};

const getAfterWorkVerificationDetails = async (id) => {
  const response = await api.get(`/manager/verifications/after/${id}`);
  return response.data;
};

const reviewAfterWorkVerification = async (id, payload) => {
  const response = await api.patch(`/manager/verifications/after/${id}/review`, payload);
  return response.data;
};

export const managerService = {
  getDashboardMetrics,
  getApprovedIssues,
  getIssueDetails,
  getWorkers,
  getWorkerDetails,
  createAssignment,
  getAssignments,
  getAssignmentDetails,
  getBeforeWorkVerifications,
  getBeforeWorkVerificationDetails,
  reviewBeforeWorkVerification,
  getAfterWorkVerifications,
  getAfterWorkVerificationDetails,
  reviewAfterWorkVerification,
  getWorkerPerformance,
  createAppraisal,
  getAppraisals,
  getAppraisalDetails,
  updateAppraisal,
  submitAppraisal
};

export default managerService;
