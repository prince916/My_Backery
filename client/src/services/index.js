import API from './api';

export const orderService = {
  createOrder:       (data)  => API.post('/orders', data),
  getMyOrders:       (params)=> API.get('/orders/my', { params }),
  getOrder:          (id)    => API.get(`/orders/${id}`),
  cancelOrder:       (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAllOrders:       (params) => API.get('/orders', { params }),
  updateOrderStatus: (id, status, note) => API.put(`/orders/${id}/status`, { status, note }),
};

export const cartService = {
  getCart:       ()       => API.get('/users/cart'),
  addToCart:     (data)   => API.post('/users/cart', data),
  updateItem:    (id, qty) => API.put(`/users/cart/${id}`, { quantity: qty }),
  removeItem:    (id)     => API.delete(`/users/cart/${id}`),
  clearCart:     ()       => API.delete('/users/cart'),
};

export const couponService = {
  validate:    (code, orderAmount) => API.post('/coupons/validate', { code, orderAmount }),
  getAll:      () => API.get('/coupons'),
  create:      (data) => API.post('/coupons', data),
  update:      (id, data) => API.put(`/coupons/${id}`, data),
  delete:      (id) => API.delete(`/coupons/${id}`),
};

export const paymentService = {
  createStripeIntent:   (orderId) => API.post('/payments/stripe/create-intent', { orderId }),
  confirmStripePayment: (data)    => API.post('/payments/stripe/confirm', data),
  createRazorpayOrder:  (orderId) => API.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpay:       (data)    => API.post('/payments/razorpay/verify', data),
};

export const reviewService = {
  create:           (data)    => API.post('/reviews', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getProductReviews:(id, params) => API.get(`/reviews/product/${id}`, { params }),
  update:           (id, data) => API.put(`/reviews/${id}`, data),
  delete:           (id)      => API.delete(`/reviews/${id}`),
};

export const userService = {
  getProfile:     () => API.get('/users/profile'),
  updateProfile:  (data) => API.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAddresses:   () => API.get('/users/addresses'),
  addAddress:     (data) => API.post('/users/addresses', data),
  updateAddress:  (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress:  (id) => API.delete(`/users/addresses/${id}`),
  getWishlist:    () => API.get('/users/wishlist'),
  toggleWishlist: (productId) => API.post(`/users/wishlist/${productId}`),
};

export const adminService = {
  getDashboardStats: () => API.get('/admin/dashboard'),
  getAllUsers:       (params) => API.get('/users', { params }),
  updateUserRole:   (id, role) => API.put(`/users/${id}/role`, { role }),
  deactivateUser:   (id) => API.put(`/users/${id}/deactivate`),
  getAllReviews:     () => API.get('/reviews'),
  toggleReviewApproval: (id) => API.put(`/reviews/${id}/approval`),
};
