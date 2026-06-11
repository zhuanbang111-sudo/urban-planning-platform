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
            placeholder="设置至少 6 位的密码"
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

        <!-- 密码不一致时的实时红字校验提示 -->
        <div v-if="passwordMismatchError" class="text-xs text-red-600 font-semibold animate-shake">
          ⚠ {{ passwordMismatchError }}
        </div>

        <!-- 注册提交按钮 -->
        <button 
          type="submit" 
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 transition-colors duration-200"
        >
          立即注册
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

const router = useRouter()

// 响应式表单数据
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordMismatchError = ref('')

// 输入时动态校验两次密码是否一致
const checkPasswordMatch = () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    passwordMismatchError.value = '两次输入的密码不一致，请重新核对。'
  } else {
    passwordMismatchError.value = ''
  }
}

// 模拟注册逻辑
const handleRegister = () => {
  // 提交时再次进行严格一致性校验
  if (password.value !== confirmPassword.value) {
    passwordMismatchError.value = '注册失败：两次密码不一致。'
    return
  }

  if (password.value.length < 6) {
    passwordMismatchError.value = '注册失败：密码长度不能少于 6 位。'
    return
  }

  passwordMismatchError.value = ''

  // 模拟将注册信息存储在本地（为后续模拟登录提供测试账户）
  localStorage.setItem('registered_email', email.value)
  localStorage.setItem('registered_password', password.value)

  alert('注册成功！正在前往登录页...')
  
  // 注册成功跳转登录页面
  router.push('/login')
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