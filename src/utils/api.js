// 保存路径: src/utils/api.js
import axios from 'axios'
import router from '../router' // 引入路由用于401跳转

// 1. 创建 Axios 基础实例
const api = axios.create({
  // 【TODO: 填入你的Worker域名，请保留 https:// 前缀】
  // 例如：baseURL: 'https://planning-platform-api.你的账号名.workers.dev',
  baseURL: 'https://【TODO: 填入你的Worker域名】', 
  timeout: 10000 // 请求超时时间设定为 10 秒
})

// 2. 请求拦截器 (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    // 每次发送请求前，自动从 localStorage 中读取真实的 token
    const token = localStorage.getItem('token')
    if (token) {
      // 按照 JWT 规范，在请求头中加入 Authorization: Bearer <token>
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    // 简化返回数据格式，直接返回后端提供的 JSON 载荷
    return response.data
  },
  (error) => {
    // 如果后端返回 401 状态码，说明 Token 错误、过期或未登录
    if (error.response && error.response.status === 401) {
      // 清除本地失效的登录凭证
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      
      // 强制跳转回登录页，并提示用户
      alert('登录已失效或未授权，请重新登录。')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// 4. 导出所有的 API 调用方法
export const register = (email, password) => {
  return api.post('/api/register', { email, password })
}

export const login = (email, password) => {
  return api.post('/api/login', { email, password })
}

export const getMe = () => {
  return api.get('/api/me')
}

export const saveToolHistory = (toolName, inputData, result) => {
  // 注意：将驼峰命名法转换为后端数据库要求的下划线命名法
  return api.post('/api/tool-history', { 
    tool_name: toolName, 
    input_data: inputData, 
    result: result 
  })
}

export const getToolHistory = () => {
  return api.get('/api/tool-history')
}

export default api