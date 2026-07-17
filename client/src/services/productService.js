import API from './api';

export const productService = {
  getProducts:     (params) => API.get('/products', { params }),
  getProduct:      (idOrSlug) => API.get(`/products/${idOrSlug}`),
  getFeatured:     () => API.get('/products/featured'),
  getRelated:      (id) => API.get(`/products/${id}/related`),
  createProduct:   (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct:   (id, data) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct:   (id) => API.delete(`/products/${id}`),
};

export const categoryService = {
  getCategories: () => API.get('/categories'),
  getCategory:   (id) => API.get(`/categories/${id}`),
  create:        (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        (id) => API.delete(`/categories/${id}`),
};
