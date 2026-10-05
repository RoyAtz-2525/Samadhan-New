import api from './api';

const getDashboardMetrics = async () => {
  const response = await api.get('/worker/dashboard');
  return response.data;
};

const getPerformance = async () => {
  const response = await api.get('/worker/performance');
  return response.data;
};

// Appraisal Methods
const getAppraisals = async () => {
  const response = await api.get('/worker/appraisals');
  return response.data;
};

const getAppraisalDetails = async (appraisalId) => {
  const response = await api.get(`/worker/appraisals/${appraisalId}`);
  return response.data;
};

const acknowledgeAppraisal = async (appraisalId) => {
  const response = await api.post(`/worker/appraisals/${appraisalId}/acknowledge`);
  return response.data;
};

const getAssignments = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/worker/assignments?${params}`);
  return response.data;
};

const getAssignmentDetails = async (id) => {
  const response = await api.get(`/worker/assignments/${id}`);
  return response.data;
};

const respondToAssignment = async (id, action, reason = '') => {
  const payload = { action };
  if (action === 'REJECT') {
    payload.reason = reason;
  }
  const response = await api.patch(`/worker/assignments/${id}/respond`, payload);
  return response.data;
};

const getBeforeVerification = async (assignmentId) => {
  const response = await api.get(`/verification/before/${assignmentId}`);
  return response.data;
};

const submitBeforeVerification = async (assignmentId, data) => {
  const formData = new FormData();
  formData.append('latitude', data.latitude);
  formData.append('longitude', data.longitude);
  if (data.siteCondition) formData.append('siteCondition', data.siteCondition);
  if (data.notes) formData.append('notes', data.notes);
  
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      formData.append('media', data.media[i]);
    }
  }

  const response = await api.post(`/verification/before/${assignmentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const getWorkExecution = async (assignmentId) => {
  const response = await api.get(`/worker/assignments/${assignmentId}/work`);
  return response.data;
};

const submitWorkProgress = async (assignmentId, data) => {
  const formData = new FormData();
  if (data.note) formData.append('note', data.note);
  
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      formData.append('media', data.media[i]);
    }
  }

  const response = await api.post(`/worker/assignments/${assignmentId}/work/progress`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const completeWork = async (assignmentId, data) => {
  const formData = new FormData();
  if (data.note) formData.append('note', data.note);
  
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      formData.append('media', data.media[i]);
    }
  }

  const response = await api.patch(`/worker/assignments/${assignmentId}/work/complete`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const getAfterVerification = async (assignmentId) => {
  const response = await api.get(`/verification/after/${assignmentId}`);
  return response.data;
};

const submitAfterVerification = async (assignmentId, data) => {
  const formData = new FormData();
  formData.append('latitude', data.latitude);
  formData.append('longitude', data.longitude);
  if (data.workSummary) formData.append('workSummary', data.workSummary);
  if (data.notes) formData.append('notes', data.notes);
  
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      formData.append('media', data.media[i]);
    }
  }

  const response = await api.post(`/verification/after/${assignmentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const workerService = {
  getDashboardMetrics,
  getAssignments,
  getAssignmentDetails,
  respondToAssignment,
  getBeforeVerification,
  submitBeforeVerification,
  getWorkExecution,
  submitWorkProgress,
  completeWork,
  getAfterVerification,
  submitAfterVerification,
  getPerformance,
  getAppraisals,
  getAppraisalDetails,
  acknowledgeAppraisal
};

export default workerService;
