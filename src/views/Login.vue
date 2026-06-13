<!-- 保存路径: src/views/Login.vue -->
<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
      
      <!-- 标题区 -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">用户登录</h2>
        <p class="mt-2 text-sm text-gray-500">
          已启用 D1 云端安全数据通道。登录后解锁规划工具与 AI 分析。
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

        <!-- 实时后端报错反馈区 -->
        <div v-if="errorMessage" class="text-xs text-red-600 font-semibold p-2.5 bg-red-50 rounded-lg border border-red-100">
          ⚠ 登录失败：{{ errorMessage }}
        </div>

        <!-- 登录提交按钮 -->
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? '正在验证身份...' : '安全登录' }}
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
import { useUserStore } from '../stores/user' // 导入我们刚才配置的 Pinia 用户库

const router = useRouter()
const route = useRoute()
const userStore = useUserStore() // 实例化 Pinia

// 响应式表单数据
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// 真实的云端登录接口调用逻辑
const handleLogin = async () => {
  // 1. 基本的前端格式预校验
  if (!email.value.includes('@')) {
    errorMessage.value = '请输入合法的邮箱格式。'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = '密码长度不能少于 8 位。'
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  // 2. 调用 Pinia Store 集中处理登录请求
  const res = await userStore.login(email.value, password.value)
  
  isSubmitting.value = false

  if (res.success) {
    alert('登录成功！欢迎回到城市规划研究平台。')
    
    // 3. 登录成功，检查是否有拦截回跳来源
    const redirectPath = route.query.redirect
    if (redirectPath) {
      router.push(redirectPath)
    } else {
      router.push('/')
    }
  } else {
    // 登录失败，显示后端回传的真实报错信息（如“账户不存在或密码错误”）
    errorMessage.value = res.message
  }
}
</script>