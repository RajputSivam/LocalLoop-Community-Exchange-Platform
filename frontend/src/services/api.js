import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getMe = () => API.get('/api/auth/me');

// Listings
export const getListings = (params) => API.get('/api/listings', { params });
export const getMyListings = () => API.get('/api/listings/my');
export const getListing = (id) => API.get(`/api/listings/${id}`);
export const createListing = (data) => API.post('/api/listings', data);
export const updateListing = (id, data) => API.put(`/api/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/api/listings/${id}`);

// Services
export const getServices = (params) => API.get('/api/services', { params });
export const getMyServices = () => API.get('/api/services/my');
export const getService = (id) => API.get(`/api/services/${id}`);
export const createService = (data) => API.post('/api/services', data);
export const deleteService = (id) => API.delete(`/api/services/${id}`);

// Borrow Requests
export const createBorrowRequest = (data) => API.post('/api/borrow/request', data);
export const getMyBorrowRequests = () => API.get('/api/borrow/my');
export const getBorrowRequest = (id) => API.get(`/api/borrow/${id}`);
export const respondToBorrow = (id, data) => API.put(`/api/borrow/${id}/respond`, data);
export const activateBorrow = (id, data) => API.put(`/api/borrow/${id}/activate`, data);
export const uploadReturnProof = (id, data) => API.put(`/api/borrow/${id}/return-proof`, data);
export const completeReturn = (id) => API.put(`/api/borrow/${id}/complete`);

// Wallet
export const getWallet = () => API.get('/api/wallet');
export const addFunds = (data) => API.post('/api/wallet/add-funds', data);
export const confirmDeposit = (data) => API.post('/api/wallet/confirm', data);

// Disputes
export const fileDispute = (data) => API.post('/api/disputes', data);
export const getMyDisputes = () => API.get('/api/disputes/my');
export const getDispute = (id) => API.get(`/api/disputes/${id}`);
export const respondToDispute = (id, data) => API.put(`/api/disputes/${id}/respond`, data);

// Messages
export const getConversations = () => API.get('/api/messages');
export const getChatMessages = (chatId) => API.get(`/api/messages/${chatId}`);
export const sendMessage = (data) => API.post('/api/messages', data);

// Reviews
export const createReview = (data) => API.post('/api/reviews', data);
export const getUserReviews = (userId) => API.get(`/api/reviews/user/${userId}`);

// Notifications
export const getNotifications = () => API.get('/api/notifications');
export const markNotificationsRead = () => API.put('/api/notifications/mark-read');

// Users
export const getUserProfile = (id) => API.get(`/api/users/${id}`);
export const updateProfile = (data) => API.put('/api/users/profile', data);

// Payments
export const getStripeConfig = () => API.get('/api/payments/config');
export const createPaymentIntent = (data) => API.post('/api/payments/create-intent', data);

export default API;
