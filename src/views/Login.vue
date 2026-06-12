<!-- 保存路径: src/views/Login.vue -->
<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">用户登录</h2>
        <p class="mt-2 text-sm text-gray-500">
          欢迎使用城市规划研究平台，登录后使用完整功能。
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
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

        <div v-if="errorMessage" class="text-xs text-red-600 font-semibold">
          ⚠ {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>安全登录</span>
        </button>
      </form>

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
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const validateEmail = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value)
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!validateEmail(email.value)) {
    errorMessage.value = '请输入合法的邮箱格式。'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = '密码长度不能少于 8 位。'
    return
  }

  loading.value = true

  try {
    const result = await userStore.login(email.value, password.value)

    if (result.success) {
      alert('登录成功！欢迎进入城市规划研究平台。')
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    } else {
      errorMessage.value = result.message || '登录失败，请检查账号和密码。'
    }
  } catch (err) {
    errorMessage.value = '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
