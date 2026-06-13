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

// 修复后正确写法
export const register = (email, password) =>
  api.post('/api/register', { email, password })

export const login = (email, password) =>
  api.post('/api/login', { email, password })

export const getMe = () =>
  api.get('/api/me')

export const getTools = (category) => {
  const params = {} 
  if (category) params.category = category
  return api.get('/api/tools', { params })
}

export const accessTool = (id) =>
  api.get(`/api/tools/${encodeURIComponent(id)}/access`)

export const getStats = () =>
  api.get('/api/stats')

export const saveToolHistory = (toolName, inputData, result) =>
  api.post('/api/tool-history', { tool_name: toolName, input_data: inputData, result })

export const getToolHistory = () =>
  api.get('/api/tool-history')
