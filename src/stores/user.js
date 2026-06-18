import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister } from '../utils/api'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isLoggedIn: false
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await apiLogin(email, password)

        if (res?.token) {
          this.token = res.token
          this.user = res.user || null
          this.isLoggedIn = true

          localStorage.setItem('token', res.token)
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('user', JSON.stringify(this.user))

          return { success: true, data: res }
        }

        return { success: false, message: res?.message || '登录失败，请重试' }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '网络连接异常'
        }
      }
    },

    // 替换 src/stores/user.js 中原有的 register 动作方法：
    async register(regData) {
      try {
        const res = await apiRegister(regData)
        return res // 直接返回后端的成功载荷 { success: true }
      } catch (error) {
        // 捕获后端的报错详情并向页面展示（例如：“该邮箱已被注册”或“验证码无效”）
        return { 
          success: false, 
          message: error.response?.data?.error || '网络连接异常，请稍后再试' 
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isLoggedIn = false

      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')

      router.push('/')
    },

    checkAuth() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const isLoggedIn = localStorage.getItem('isLoggedIn')

      if (token && userStr === null) {
        this.token = token
        this.user = null
        this.isLoggedIn = true
        return
      }

      if (token && userStr && isLoggedIn === 'true') {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isLoggedIn = true
      }
    }
  }
})