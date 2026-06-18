<!-- 保存路径: src/views/Register.vue -->
<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-8 bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-pop-in">
      
      <!-- 顶部两个切换选项卡 -->
      <div class="flex border-b border-gray-200">
        <button 
          @click="registerType = 'invite'"
          :class="[
            registerType === 'invite' 
              ? 'border-b-2 border-green-600 text-green-700 bg-green-50/50 font-bold' 
              : 'text-gray-500 hover:text-gray-800'
          ]"
          class="flex-1 py-4 text-center text-sm font-semibold transition-all focus:outline-none"
        >
          🎫 我有邀请码
        </button>
        <button 
          @click="registerType = 'apply'"
          :class="[
            registerType === 'apply' 
              ? 'border-b-2 border-blue-900 text-blue-900 bg-blue-50/30 font-bold' 
              : 'text-gray-500 hover:text-gray-800'
          ]"
          class="flex-1 py-4 text-center text-sm font-semibold transition-all focus:outline-none"
        >
          📋 申请注册
        </button>
      </div>

      <!-- 主体表单包 -->
      <div class="p-8">
        <!-- 未成功提交申请状态：正常显示表单 -->
        <div v-if="!applySuccess" class="space-y-5">
          <div>
            <h3 class="text-2xl font-black text-gray-900">
              {{ registerType === 'invite' ? '邀请注册通道' : '人工审核通道' }}
            </h3>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              {{ registerType === 'invite' ? '凭专用工作密钥一秒激活权限，立等可入。' : '填写科研背景和单位全称，管理员极速人工审批。' }}
            </p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- 邮箱输入 -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">工作邮箱（必填）</label>
              <input 
                v-model="email" 
                type="email" 
                required 
                placeholder="请输入常用工作邮箱"
                class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <!-- 密码输入 (带强度校正) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">登录密码</label>
              <input 
                v-model="password" 
                type="password" 
                required 
                placeholder="密码不少于8位"
                @input="handlePasswordInput"
                class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
              
              <!-- 密码强度条 -->
              <div v-if="password" class="mt-2 space-y-1 animate-fade-in">
                <div class="flex justify-between text-xxs font-black">
                  <span>安全级别：{{ strength.text }}</span>
                </div>
                <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    :class="strengthColorClass" 
                    :style="{ width: strengthWidth }"
                    class="h-full transition-all duration-300"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 确认密码 -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">确认密码</label>
              <input 
                v-model="confirmPassword" 
                type="password" 
                required 
                placeholder="请再次键入密码"
                class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>

            <!-- [分流表单项 1] 我有邀请码 -->
            <div v-if="registerType === 'invite'" class="space-y-1 animate-fade-in">
              <label class="block text-xs font-bold text-gray-700 uppercase">邀请激活密钥（必填）</label>
              <input 
                v-model="inviteCode" 
                type="text" 
                required 
                placeholder="XXXX-XXXX"
                @input="inviteCode = inviteCode.toUpperCase()"
                class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm font-mono tracking-wider focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
              <p class="text-xxs text-gray-500">
                没有邀请密钥？点击上方选择 <span class="font-bold text-blue-900 cursor-pointer" @click="registerType = 'apply'">「申请注册」</span> 人工通道。
              </p>
            </div>

            <!-- [分流表单项 2] 申请注册 -->
            <div v-else class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">真实姓名（必填）</label>
                <input 
                  v-model="applyName" 
                  type="text" 
                  required 
                  placeholder="请输入您的姓名"
                  class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">所在工作单位/研究机构（必填）</label>
                <input 
                  v-model="applyOrg" 
                  type="text" 
                  required 
                  placeholder="请输入完整的规划设计单位或院校名称"
                  class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">使用诉求（选填）</label>
                <textarea 
                  v-model="applyReason" 
                  rows="3" 
                  placeholder="可简述您的科研计算或规划案例分析需求，有助于加快后台审批通过速率。"
                  class="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
                ></textarea>
              </div>
            </div>

            <!-- 错误反馈提示条 -->
            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold animate-shake">
              ⚠ {{ errorMessage }}
            </div>

            <!-- 注册提交按钮 -->
            <button 
              type="submit" 
              :disabled="loading"
              :class="[
                registerType === 'invite' 
                  ? 'bg-green-700 hover:bg-green-600 focus:ring-green-700' 
                  : 'bg-blue-900 hover:bg-blue-800 focus:ring-blue-900'
              ]"
              class="w-full py-3 text-white font-bold rounded-xl shadow-md transition-all duration-150 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ loading ? '正在校验写入中...' : (registerType === 'invite' ? '核销密钥并注册' : '提交人工审核') }}
            </button>
          </form>
        </div>

        <!-- 申请成功提交状态：卡片呈现 -->
        <div v-else class="text-center py-8 space-y-6 animate-pop-in">
          <div class="mx-auto h-20 w-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <!-- 勾图 -->
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-black text-gray-900">人工申请提交成功！</h3>
            <p class="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              平台管理员将在 **1-3 个工作日** 内核对您的规划从业或科研资质进行核发授权。通过后，将直接给您的注册邮箱分配额度并解锁，届时可直接登录。
            </p>
          </div>
          <router-link 
            to="/" 
            class="inline-block px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow transition-colors text-sm"
          >
            返回平台主站
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 状态参数
const registerType = ref('invite') // 'invite' 或 'apply'
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const inviteCode = ref('')
const applyName = ref('')
const applyOrg = ref('')
const applyReason = ref('')
const errorMessage = ref('')
const loading = ref(false)
const applySuccess = ref(false)

// 密码强度算法引擎
const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, text: '未输入', color: 'gray' }
  if (pwd.length < 8) return { level: 0, text: '密码太短', color: 'red' }
  const hasLetter = /[A-Za-z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(pwd)
  if (hasLetter && hasNumber && hasSpecial && pwd.length >= 12) {
    return { level: 3, text: '强度极强', color: 'green' }
  }
  if (hasLetter && hasNumber) {
    return { level: 2, text: '强度良好', color: 'blue' }
  }
  return { level: 1, text: '强度较弱', color: 'orange' }
}

const strength = computed(() => getPasswordStrength(password.value))

const strengthColorClass = computed(() => {
  switch (strength.value.color) {
    case 'red': return 'bg-red-500'
    case 'orange': return 'bg-orange-400'
    case 'blue': return 'bg-blue-600'
    case 'green': return 'bg-green-600'
    default: return 'bg-gray-300'
  }
})

const strengthWidth = computed(() => {
  switch (strength.value.level) {
    case 0: return '25%'
    case 1: return '50%'
    case 2: return '75%'
    case 3: return '100%'
    default: return '0%'
  }
})

// 提交注册表单
const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致，请重新核对。'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = '密码长度必须至少为 8 位。'
    return
  }

  errorMessage.value = ''
  loading.value = true

  // 整理发送的入参
  const regData = {
    email: email.value,
    password: password.value,
    register_type: registerType.value,
    invite_code: inviteCode.value,
    apply_name: applyName.value,
    apply_org: applyOrg.value,
    apply_reason: applyReason.value
  }

  try {
    const res = await userStore.register(regData)
    if (res.success) {
      if (registerType.value === 'invite') {
        alert('邀请密钥核销通过，账户激活成功！')
        router.push('/login')
      } else {
        // 展示申请提交成功卡片
        applySuccess.value = true
      }
    } else {
      errorMessage.value = res.message
    }
  } catch (err) {
    errorMessage.value = '网络交互异常，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.animate-pop-in {
  animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>