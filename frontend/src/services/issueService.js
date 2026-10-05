import api from './api';

export const getIssueCategories = async () => {
  const response = await api.get('/issues/categories');
  return response.data;
};

export const createIssue = async (formData) => {
  const response = await api.post('/issues', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getMyIssues = async (status = 'ALL') => {
  const response = await api.get(`/issues/my?status=${status}`);
  return response.data;
};

export const getIssueDetails = async (id) => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

export const submitReview = async (issueId, data) => {
  const response = await api.post(`/issues/${issueId}/review`, data);
  return response.data;
};

export const getReview = async (issueId) => {
  const response = await api.get(`/issues/${issueId}/review`);
  return response.data;
};

export const submitFeedback = async (issueId, data) => {
  const response = await api.post(`/issues/${issueId}/feedback`, data);
  return response.data;
};

export const getFeedback = async (issueId) => {
  const response = await api.get(`/issues/${issueId}/feedback`);
  return response.data;
};
