<!-- 保存路径: src/views/Register.vue -->
<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
      
      <!-- 标题区 -->
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">新用户注册</h2>
        <p class="mt-2 text-sm text-gray-500">
          注册成为规划师，享受专属AI政策解析和标准文件下载特权。
        </p>
      </div>

      <!-- 注册表单 -->
      <form class="space-y-4" @submit.prevent="handleRegister">
        <!-- 邮箱输入框 -->
        <div>
          <label for="email" class="block text-sm font-semibold text-gray-700">邮箱地址</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required 
            placeholder="注册邮箱，将用作唯一登录账号"
            class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
          />
        </div>

        <!-- 密码输入框 -->
        <div>
          <label for="password" class="block text-sm font-semibold text-gray-700">设置密码</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            placeholder="设置至少 8 位的密码"
            class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
          />
        </div>

        <!-- 确认密码输入框 -->
        <div>
          <label for="confirmPassword" class="block text-sm font-semibold text-gray-700">确认密码</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            required 
            placeholder="请再次输入上方设定的密码"
            @input="checkPasswordMatch"
            class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
          />
        </div>

        <div v-if="errorMessage" class="text-xs text-red-600 font-semibold">
          ⚠ {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span v-if="loading">注册中...</span>
          <span v-else>立即注册</span>
        </button>
      </form>

      <!-- 底部辅助链接 -->
      <div class="text-center text-sm text-gray-500 mt-4">
        已有账号？
        <router-link to="/login" class="font-semibold text-blue-900 hover:text-blue-800">
          直接去登录
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)

const validateEmail = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value)
}

const checkPasswordMatch = () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致，请重新核对。'
  } else {
    errorMessage.value = ''
  }
}

const handleRegister = async () => {
  errorMessage.value = ''

  if (!validateEmail(email.value)) {
    errorMessage.value = '请输入合法的邮箱格式。'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = '密码长度不能少于 8 位。'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致，请重新核对。'
    return
  }

  loading.value = true

  try {
    const result = await userStore.register(email.value, password.value)
    if (result.success) {
      alert('注册成功，请登录')
      router.push('/login')
    } else {
      errorMessage.value = result.message || '注册失败，请稍后重试。'
    }
  } catch (err) {
    errorMessage.value = '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 轻微抖动报错动效 */
.animate-shake {
  animation: shake 0.2s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>