<!-- 保存路径: src/views/admin/AdminInviteCodes.vue -->
<template>
  <div class="space-y-6 animate-fade-in relative">
    
    <!-- 头部与生成按钮 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">🎫 邀请码管理</h2>
        <p class="text-xs text-gray-500 mt-1">核发具有特定使用次数与时效的邀请密钥，供特定规划项目组成员免审核快速注册。</p>
      </div>
      <button 
        @click="showFormModal = true" 
        class="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-all focus:outline-none"
      >
        + 生成新邀请码
      </button>
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">正在调取密钥清单...</p>
    </div>

    <!-- 空列表状态 -->
    <div v-else-if="list.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <span class="text-4xl">🎫</span>
      <h3 class="text-base font-bold text-gray-700 mt-4">暂未核发任何邀请密钥</h3>
      <p class="text-xs text-gray-400 mt-1">请点击右上方按钮开始核发首枚邀请码。</p>
    </div>

    <!-- 列表数据 -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 text-left">邀请密钥</th>
              <th class="px-6 py-4 text-left">使用情况 (已用/最大)</th>
              <th class="px-6 py-4 text-left">到期时间</th>
              <th class="px-6 py-4 text-left max-w-xs">备注</th>
              <th class="px-6 py-4 text-left">创建时间</th>
              <th class="px-6 py-4 text-center w-28">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-700">
            <tr v-for="code in list" :key="code.id" class="hover:bg-gray-50/50 transition-colors">
              <!-- 邀请码及失效标签 -->
              <td class="px-6 py-4 font-mono font-bold tracking-wider flex items-center space-x-2">
                <span :class="isInvalid(code) ? 'line-through text-gray-400' : 'text-blue-900'">
                  {{ code.code }}
                </span>
                <!-- 失效标签 -->
                <span v-if="isInvalid(code)" class="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500 font-black">
                  已失效
                </span>
              </td>

              <!-- 核销次数 -->
              <td class="px-6 py-4 text-xs font-semibold text-gray-600">
                {{ code.used_count }} / {{ code.max_uses }}
              </td>

              <!-- 到期时间 -->
              <td class="px-6 py-4 text-xs">
                <span v-if="!code.expires_at" class="text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">永久有效</span>
                <span v-else-if="new Date(code.expires_at) < new Date()" class="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">已过期</span>
                <span v-else class="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">{{ formatDate(code.expires_at) }}</span>
              </td>

              <!-- 备注 -->
              <td class="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" :title="code.note">
                {{ code.note || '-' }}
              </td>

              <!-- 创建时间 -->
              <td class="px-6 py-4 text-xs text-gray-400 font-mono">{{ formatDate(code.created_at) }}</td>

              <!-- 操作列 -->
              <td class="px-6 py-4 text-center">
                <button 
                  @click="handleRevoke(code.id)"
                  class="text-red-600 hover:text-red-700 text-xs font-bold"
                >
                  撤销
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 弹窗 1：创建邀请码配置 Modal -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-pop-in">
        <h3 class="text-lg font-bold text-gray-900 mb-4">生成新邀请码</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700">最大使用次数</label>
            <input 
              v-model.number="form.max_uses" 
              type="number" 
              required 
              min="1"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700">有效期天数 (留空则永久有效)</label>
            <input 
              v-model.number="form.expires_days" 
              type="number" 
              min="1"
              placeholder="例如：30"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700">备注说明</label>
            <input 
              v-model="form.note" 
              type="text" 
              placeholder="发给张三"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div class="mt-6 flex space-x-3 pt-2">
            <button @click="showFormModal = false" type="button" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold disabled:bg-gray-400">立即生成</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 弹窗 2：生成成功大卡片展示 Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4 animate-pop-in">
        <span class="text-4xl">🎉</span>
        <h3 class="text-lg font-bold text-gray-900">邀请密钥生成成功</h3>
        
        <div class="bg-gray-100 border border-gray-200 py-3 px-4 rounded-xl text-xl font-mono font-bold tracking-widest text-blue-900 shadow-inner">
          {{ createdCode }}
        </div>

        <div class="flex space-x-3 pt-2">
          <button 
            @click="copyCode" 
            class="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all shadow"
          >
            {{ hasCopied ? '已复制 ✓' : '一键复制' }}
          </button>
          <button @click="showSuccessModal = false" class="flex-1 py-2.5 border border-gray-300 text-gray-500 rounded-lg text-xs font-bold">关闭</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const showFormModal = ref(false)
const showSuccessModal = ref(false)

const createdCode = ref('')
const hasCopied = ref(false)

const form = ref({
  max_uses: 1,
  expires_days: null,
  note: ''
})

// 统一封装管理端带有 Token 的 Axios 头对象
const getAdminHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// 同步列表数据 (调起免代理自定义域)
const fetchInviteCodes = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://api.urbancopilot.qzz.io/api/admin/invite-codes', getAdminHeaders())
    list.value = res.data.invite_codes || []
  } catch (err) {
    console.error('拉取密钥列表异常:', err)
  } finally {
    loading.value = false
  }
}

// 调起弹窗配置
const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      max_uses: Number(form.value.max_uses),
      expires_days: form.value.expires_days ? Number(form.value.expires_days) : null,
      note: form.value.note.trim()
    }
    
    const res = await axios.post(
      'https://api.urbancopilot.qzz.io/api/admin/invite-codes', 
      payload, 
      getAdminHeaders()
    )
    if (res.data.success) {
      createdCode.value = res.data.code
      showFormModal.value = false
      showSuccessModal.value = true
      hasCopied.value = false
      
      // 重置原表单参数
      form.value = { max_uses: 1, expires_days: null, note: '' }
      await fetchInviteCodes()
    }
  } catch (err) {
    alert('密钥生成异常：' + (err.response?.data?.error || '网络访问超时'))
  } finally {
    submitting.value = false
  }
}

// 拷贝操作
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(createdCode.value)
    hasCopied.value = true
  } catch (err) {
    alert('复制失败，请手动选择复制。')
  }
}

// 撤销删除操作
const handleRevoke = async (id) => {
  if (confirm('确定要撤销该邀请码吗？此操作不可恢复。')) {
    try {
      const res = await axios.delete(
        `https://api.urbancopilot.qzz.io/api/admin/invite-codes/${encodeURIComponent(id)}`, 
        getAdminHeaders()
      )
      if (res.data.success) {
        await fetchInviteCodes()
      }
    } catch (err) {
      alert('撤销失败：' + (err.response?.data?.error || '网络访问超时'))
    }
  }
}

// 失效验证逻辑：已用完或已过期
const isInvalid = (code) => {
  const isUsedOut = parseInt(code.used_count) >= parseInt(code.max_uses)
  const isTimeExpired = code.expires_at && new Date(code.expires_at) < new Date()
  return isUsedOut || isTimeExpired
}

// 转换时间格式
const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.split('T')[0]
}

onMounted(() => {
  fetchInviteCodes()
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
.animate-pop-in { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>