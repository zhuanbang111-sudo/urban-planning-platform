// 保存路径: src/stores/user.js
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister } from '../utils/api'
import router from '../router'

export const useUserStore = defineStore('user', {
  // 1. 定义全局状态 (State)
  state: () => ({
    user: null,        // 存放用户的具体信息（邮箱、角色等）
    token: null,       // 存放 JWT 令牌
    isLoggedIn: false  // 标识当前是否已登录
  }),

  // 2. 定义全局动作逻辑 (Actions)
  actions: {
    // 登录动作
    async login(email, password) {
      try {
        // 调用 api.js 中的真实网络请求接口
        const res = await apiLogin(email, password)
        
        if (res.success) {
          // 更新 Pinia 内存中的状态
          this.token = res.token
          this.user = res.user
          this.isLoggedIn = true
          
          // 将关键信息持久化存储到浏览器的 localStorage 中（兼容我们之前写的 NavBar 逻辑）
          localStorage.setItem('token', res.token)
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userEmail', res.user.email)
          localStorage.setItem('user', JSON.stringify(res.user))
          
          return { success: true }
        }
      } catch (error) {
        // 将后端返回的具体错误信息抛出，方便前端显示报错
        return { 
          success: false, 
          message: error.response?.data?.message || '网络连接异常' 
        }
      }
    },

    // 注册动作
    async register(email, password) {
      try {
        const res = await apiRegister(email, password)
        return res // 返回 { success: true, message: '注册成功' }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || '网络连接异常' 
        }
      }
    },

    // 登出动作
    logout() {
      // 1. 清空内存状态
      this.user = null
      this.token = null
      this.isLoggedIn = false
      
      // 2. 清除所有相关本地缓存
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('user')
      
      // 3. 强制跳回首页
      router.push('/')
    },

    // 页面刷新时恢复状态机制
    checkAuth() {
      // 从本地存储读取
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      
      // 如果本地存有有效的令牌和用户信息，则重塑内存状态
      if (token && userStr && isLoggedIn === 'true') {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isLoggedIn = true
      }
    }
  }
})