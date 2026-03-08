import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach JWT ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Token refresh state ──────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
  failedQueue = []
}

// ── Response: unwrap backend envelope { success, message, data }
api.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res && typeof res === 'object' && 'success' in res) {
      return res.data !== undefined ? res.data : res
    }
    return res
  },
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('skillswap_refresh_token')

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
        }

        original._retry = true
        isRefreshing = true

        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefresh } = res.data?.data || res.data
          localStorage.setItem('skillswap_token', accessToken)
          if (newRefresh) localStorage.setItem('skillswap_refresh_token', newRefresh)
          processQueue(null, accessToken)
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          localStorage.removeItem('skillswap_token')
          localStorage.removeItem('skillswap_refresh_token')
          localStorage.removeItem('skillswap_user')
          if (!window.location.pathname.startsWith('/login') &&
              !window.location.pathname.startsWith('/signup')) {
            window.location.href = '/login'
          }
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      }

      localStorage.removeItem('skillswap_token')
      localStorage.removeItem('skillswap_refresh_token')
      localStorage.removeItem('skillswap_user')
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login'
      }
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }

    const message = error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject({ message, status: error.response?.status })
  }
)

export default api
