import { http } from './client'

export const authApi = {
  login: (body) => http.post('/auth/login', body),       // -> { token, user }
  register: (body) => http.post('/auth/register', body), // -> { token, user }
}

export const productsApi = {
  list: (params, signal) => http.get('/products', { params, signal }),
  get: (id, signal) => http.get(`/products/${id}`, { signal }),
}

// Every cart call must return the FULL cart: { items, subtotal, discount, total }
export const cartApi = {
  get: (signal) => http.get('/cart', { signal }),
  add: (productId, quantity) => http.post('/cart/items', { productId, quantity }),
  update: (productId, quantity) => http.patch(`/cart/items/${productId}`, { quantity }),
  remove: (productId) => http.delete(`/cart/items/${productId}`),
}

export const checkoutApi = {
  create: (body, idempotencyKey) =>
    http.post('/checkout', body, { headers: { 'Idempotency-Key': idempotencyKey } }), // -> { orderId, checkoutUrl }
}

export const ordersApi = {
  list: (signal) => http.get('/orders', { signal }),
  get: (id, signal) => http.get(`/orders/${id}`, { signal }),
}

export const aiApi = {
  recommend: (prompt) => http.post('/ai/recommendations', { prompt }), // -> { summary, products: [...] }
}