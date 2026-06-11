<!-- 保存路径: src/views/Login.vue -->
<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
      
      <!-- 标题区 -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">用户登录</h2>
        <p class="mt-2 text-sm text-gray-500">
          欢迎使用城市规划研究平台，登录后使用完整功能。
        </p>
      </div>

      <!-- 登录表单 -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <!-- 邮箱输入框 -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700">邮箱地址</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            placeholder="请输入您的常用工作邮箱"
            class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
          />
        </div>

        <!-- 密码输入框 -->
        <div>
          <label for="password" class="block text-sm font-semibold text-gray-700">账户密码</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            placeholder="请输入登录密码"
            class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
          />
        </div>

        <!-- 前端校验提示语（若有） -->
        <div v-if="errorMessage" class="text-xs text-red-600 font-semibold">
          ⚠ {{ errorMessage }}
        </div>

        <!-- 登录提交按钮 -->
        <button 
          type="submit" 
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors duration-200"
        >
          安全登录
        </button>
      </form>

      <!-- 底部辅助说明 -->
      <div class="text-center text-sm text-gray-500 mt-4">
        还没有账号？
        <router-link to="/register" class="font-semibold text-blue-900 hover:text-blue-800">
          立即注册账户
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式表单数据
const email = ref('')
const password = ref('')
const errorMessage = ref('')

// 模拟登录执行逻辑
const handleLogin = () => {
  // 简单的前端格式验证
  if (!email.value.includes('@')) {
    errorMessage.value = '请输入合法的邮箱格式。'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = '密码长度不能少于 6 位。'
    return
  }

  errorMessage.value = ''

  // 1. 将模拟登录成功状态存入本地存储 localStorage
  localStorage.setItem('isLoggedIn', 'true')
  localStorage.setItem('userEmail', email.value) // 保存用户输入邮箱，顶部导航栏会读取它并显示
  localStorage.setItem('mockToken', 'mock-jwt-token-123456') // 模拟一个假Token

  alert('登录成功！欢迎进入城市规划研究平台。')

  // 2. 检测路由中是否带有之前因权限被拦截前原本想去的链接 (redirect)
  const redirectPath = route.query.redirect
  if (redirectPath) {
    // 自动重定向回到原本由于未登录拦截的那个页面（例如：规划工具页）
    router.push(redirectPath)
  } else {
    // 否则直接进入首页
    router.push('/')
  }
}
</script>