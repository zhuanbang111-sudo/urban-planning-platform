import axios from 'axios'
import router from '../router'

const WORKER_BASE_URL = 'https://planning-platform-api.zhuanbang111.workers.dev/' // TODO: 替换为你的 Cloudflare Worker 域名

const api = axios.create({
  baseURL: WORKER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export const register = (email, password) => {
  return api.post('/register', { email, password })
}

export const login = (email, password) => {
  return api.post('/login', { email, password })
}

export const getMe = () => {
  return api.get('/me')
}

export const saveToolHistory = (toolName, inputData, result) => {
  return api.post('/tool-history', { toolName, inputData, result })
}

export const getToolHistory = () => {
  return api.get('/tool-history')
}
