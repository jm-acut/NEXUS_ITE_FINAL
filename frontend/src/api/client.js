import axios from 'axios'

export const TOKEN_KEY = 'nexus_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Convert every failure into the backend's error envelope shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err)
    const status = err.response?.status ?? 0
    const body = err.response?.data
    const apiError = {
      status,
      code: body?.error?.code ?? (status ? 'UNKNOWN_ERROR' : 'NETWORK_ERROR'),
      message:
        body?.error?.message ??
        (status ? 'Something went wrong.' : 'Cannot reach the server. Check your connection.'),
      details: body?.error?.details ?? null,
      requestId: body?.requestId ?? null,
    }
    if (status === 401) window.dispatchEvent(new Event('auth:unauthorized'))
    return Promise.reject(apiError)
  },
)

// Unwrap { success: true, data, meta }
const unwrap = (promise) =>
  promise.then((res) => ({ data: res.data.data, meta: res.data.meta ?? null }))

export const http = {
  get: (url, config) => unwrap(api.get(url, config)),
  post: (url, body, config) => unwrap(api.post(url, body, config)),
  patch: (url, body, config) => unwrap(api.patch(url, body, config)),
  delete: (url, config) => unwrap(api.delete(url, config)),
}

export const isCancel = axios.isCancel