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
