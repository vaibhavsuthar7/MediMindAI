import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
const baseURL = rawBaseUrl ? `${rawBaseUrl.replace(/\/$/, '')}/api` : '/api'

const api = axios.create({ baseURL, timeout: 30000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medimind_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medimind_token')
      localStorage.removeItem('medimind_user')
    }
    return Promise.reject(error)
  }
)

export default api
