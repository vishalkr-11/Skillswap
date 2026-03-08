// frontend/src/services/index.js
import api from './api'

export const authService = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
  getMe:    ()     => api.get('/auth/me'),
}

export const providerService = {
  getAll:        (params) => api.get('/providers', { params }),
  getById:       (id)     => api.get(`/providers/${id}`),
  updateProfile: (data)   => api.patch('/providers/profile', data),
}

export const serviceService = {
  getAll:  (params)   => api.get('/services', { params }),
  getById: (id)       => api.get(`/services/${id}`),
  create:  (data)     => api.post('/services', data),
  update:  (id, data) => api.put(`/services/${id}`, data),
  delete:  (id)       => api.delete(`/services/${id}`),
}

export const bookingService = {
  create:              (data)   => api.post('/bookings', data),
  getUserBookings:     (params) => api.get('/bookings/user', { params }),
  getProviderBookings: (params) => api.get('/bookings/provider', { params }),
  updateStatus:        (id, data) => api.patch(`/bookings/${id}/status`, data),
}

export const reviewService = {
  create:        (data) => api.post('/reviews', data),
  getByProvider: (id)   => api.get(`/reviews/provider/${id}`),
  reply:         (id, text) => api.post(`/reviews/${id}/reply`, { text }),
}

export const messageService = {
  sendMessage:  (data)   => api.post('/messages', data),
  getMessages:  (chatId) => api.get(`/messages/${chatId}`),
  getUserChats: ()       => api.get('/messages/chats'),
  getUnread:    ()       => api.get('/messages/unread'),
}

export const aiService = {
  recommend: (data) => api.post('/ai/recommend', data),
}

export const paymentService = {
  createOrder:  (data) => api.post('/payments/create-order', data),
  verifyPayment:(data) => api.post('/payments/verify', data),
}