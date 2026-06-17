// 保存路径: src/utils/api.js
import axios from 'axios'
import router from '../router'

// 已锁定的您真实的 Cloudflare Worker 域名
const WORKER_BASE_URL = 'https://planning-platform-api.zhuanbang111.workers.dev/' 

const api = axios.create({
  baseURL: WORKER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动读取并注入登录令牌 Token
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

// 响应拦截器：遇到 401（未登录或 Token 失效）自动清理状态并踢回登录页
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

// ---------------------------------------------------------
// 核心业务网络 API 请求接口列表
// ---------------------------------------------------------

// 1. 用户注册
export const register = (email, password) =>
  api.post('/api/register', { email, password })

// 2. 用户登录
export const login = (email, password) =>
  api.post('/api/login', { email, password })

// 3. 获取当前登录用户信息
export const getMe = () =>
  api.get('/api/me')

// 4. 获取规划工具清单（当分类为“全部”时，不传递筛选参数，获取完整工具）
export const getTools = (category) => {
  const params = {} 
  if (category && category !== '全部') {
    params.category = category
  }
  return api.get('/api/tools', { params })
}

// 5. 校验并获取特定工具的运行授权及内嵌网址
export const accessTool = (id) =>
  api.get(`/api/tools/${encodeURIComponent(id)}/access`)

// 6. 获取公开的统计指标数据
export const getStats = () =>
  api.get('/api/stats')

// 7. 保存特定的工具指标计算历史
export const saveToolHistory = (toolName, inputData, result) =>
  api.post('/api/tool-history', { tool_name: toolName, input_data: inputData, result })

// 8. 获取当前用户的最近 20 条计算历史记录
export const getToolHistory = () =>
  api.get('/api/tool-history')