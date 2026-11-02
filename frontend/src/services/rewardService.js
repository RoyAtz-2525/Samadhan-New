import api from './api';

export const getRewardSummary = async () => {
  const response = await api.get('/citizen/rewards/summary');
  return response.data?.data || response.data;
};

export const getRewardHistory = async (params = {}) => {
  const response = await api.get('/citizen/rewards/history', { params });
  return response.data?.data || response.data;
};

export const getRewardCatalog = async () => {
  const response = await api.get('/citizen/rewards/catalog');
  return response.data?.data || response.data;
};

export const redeemReward = async (catalogItemId) => {
  const response = await api.post('/citizen/rewards/redeem', { catalogItemId });
  return response.data;
};

export const getAdminRewardAudit = async (params = {}) => {
  const response = await api.get('/admin/rewards/audit', { params });
  return response.data?.data || response.data;
};

export default {
  getRewardSummary,
  getRewardHistory,
  getRewardCatalog,
  redeemReward,
  getAdminRewardAudit,
};
