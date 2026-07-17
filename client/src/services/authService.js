import API from './api';

export const authService = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  logout:         ()     => API.post('/auth/logout'),
  getMe:          ()     => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => API.put('/auth/update-password', data),
  verifyEmail:    (token) => API.get(`/auth/verify-email/${token}`),
};
