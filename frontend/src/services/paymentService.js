import api from './api';

export const createPaymentOrder = async (assignmentId) => {
  const response = await api.post(`/manager/assignments/${assignmentId}/order`);
  return response.data;
};

export const verifyPayment = async (paymentId, razorpayData) => {
  const response = await api.post(`/manager/payments/${paymentId}/verify`, razorpayData);
  return response.data;
};

export const getPaymentByAssignment = async (assignmentId) => {
  const response = await api.get(`/manager/assignments/${assignmentId}/payment`);
  return response.data;
};

export const getPaymentDetails = async (paymentId) => {
  const response = await api.get(`/manager/payments/${paymentId}`);
  return response.data;
};

export const getManagerPayments = async () => {
  const response = await api.get('/manager/payments');
  return response.data;
};

export const getWorkerPayments = async () => {
  const response = await api.get('/worker/payments');
  return response.data;
};

// RazorpayX Worker Bank / UPI Payouts
export const getWorkerPayoutAccount = async () => {
  const response = await api.get('/worker/payout-account');
  return response.data;
};

export const saveWorkerPayoutAccount = async (data) => {
  const response = await api.post('/worker/payout-account', data);
  return response.data;
};

export const initiateWorkerPayout = async (assignmentId, options = {}) => {
  const response = await api.post(`/manager/assignments/${assignmentId}/payout`, options);
  return response.data;
};
