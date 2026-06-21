<!-- 保存路径: src/views/admin/AdminUsers.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部与筛选栏 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">👥 平台用户管理</h2>
        <p class="text-xs text-gray-500 mt-1">管理员专属：查看注册人员、更改账号状态、核发/续期高阶付费会员级别。</p>
      </div>

      <!-- 快速筛选器 -->
      <div class="flex items-center space-x-2">
        <label class="text-xs font-bold text-gray-500 whitespace-nowrap">筛选等级:</label>
        <select 
          v-model="filterLevel" 
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-900"
        >
          <option value="all">全部用户</option>
          <option value="vip">仅显示付费会员</option>
          <option value="free">仅显示免费用户</option>
        </select>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
            <tr>
              <th class="px-6 py-4 text-left">用户邮箱</th>
              <th class="px-6 py-4 text-left w-24">系统角色</th>
              <th class="px-6 py-4 text-left w-24">账号状态</th>
              <th class="px-6 py-4 text-left w-28">会员等级</th>
              <th class="px-6 py-4 text-left">到期时间</th>
              <th class="px-6 py-4 text-left max-w-xs">管理员备注</th>
              <th class="px-6 py-4 text-center w-56">快速操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-700">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-xs text-gray-400">
                暂无匹配的用户记录。
              </td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
              <!-- 邮箱 -->
              <td class="px-6 py-4 font-medium text-gray-900 font-mono">{{ user.email }}</td>
              
              <!-- 角色 -->
              <td class="px-6 py-4 text-xs font-semibold">
                <span v-if="user.role === 'admin'" class="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center w-max space-x-1">
                  <span>⭐</span> <span>管理员</span>
                </span>
                <span v-else class="text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">普通用户</span>
              </td>

              <!-- 状态 -->
              <td class="px-6 py-4 text-xs font-semibold">
                <span v-if="user.status === 'active'" class="text-green-700 bg-green-50 px-2 py-0.5 rounded">活跃可用</span>
                <span v-else-if="user.status === 'pending'" class="text-orange-600 bg-orange-50 px-2 py-0.5 rounded animate-pulse">待审核</span>
                <span v-else class="text-red-600 bg-red-50 px-2 py-0.5 rounded">已拒绝</span>
              </td>

              <!-- 会员等级 -->
              <td class="px-6 py-4 text-xs font-semibold">
                <span v-if="Number(user.download_level ?? 1) >= 2" class="text-green-800 bg-green-100 px-2.5 py-1 rounded-full">
                  👑 付费会员
                </span>
                <span v-else class="text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                  免费用户
                </span>
              </td>

              <!-- 到期时间 (带临期和过期红色视觉警示) -->
              <td class="px-6 py-4 text-xs font-medium">
                <span v-if="!user.membership_expires_at" class="text-gray-400">-</span>
                <div v-else class="flex flex-col">
                  <span class="font-mono text-gray-900">{{ formatDate(user.membership_expires_at) }}</span>
                  <!-- 临期与到期动态提示条 -->
                  <span 
                    v-if="isExpired(user.membership_expires_at)" 
                    class="text-xxs text-red-600 font-bold"
                  >
                    (已过期)
                  </span>
                  <span 
                    v-else-if="getRemainingDays(user.membership_expires_at) <= 7" 
                    class="text-xxs text-orange-500 font-bold animate-pulse"
                  >
                    (即将到期: 剩 {{ getRemainingDays(user.membership_expires_at) }} 天)
                  </span>
                </div>
              </td>

              <!-- 备注说明 -->
              <td class="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" :title="user.membership_note">
                {{ user.membership_note || '-' }}
              </td>

              <!-- 快速操作动作组 -->
              <td class="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                <button 
                  @click="openEditModal(user)" 
                  class="text-blue-900 hover:text-blue-700 text-xs font-bold"
                >
                  编辑
                </button>
                <button 
                  @click="quickExtend(user, 1)" 
                  class="text-green-700 hover:text-green-600 text-xs font-bold"
                  title="在现有有效期上往后顺延 1 个月"
                >
                  +1个月
                </button>
                <button 
                  @click="quickExtend(user, 12)" 
                  class="text-purple-700 hover:text-purple-600 text-xs font-bold"
                  title="在现有有效期上往后顺延 1 年"
                >
                  +1年
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 弹窗：编辑用户主档及会员资质 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto animate-pop-in">
        <h3 class="text-lg font-bold text-gray-900 mb-4">编辑用户权限及会员组</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 邮箱账号展示 -->
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase">登录账号</label>
            <input 
              :value="form.email" 
              type="text" 
              disabled 
              class="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-400 cursor-not-allowed font-mono"
            />
          </div>

          <!-- 角色下拉选择 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">系统角色</label>
            <select v-model="form.role" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700">
              <option value="user">普通用户 (user)</option>
              <option value="admin">系统管理员 (admin)</option>
            </select>
          </div>

          <!-- 账号审核状态下拉选择 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">注册状态</label>
            <select v-model="form.status" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700">
              <option value="active">活跃可用 (active)</option>
              <option value="pending">待审核 (pending)</option>
              <option value="rejected">已拒绝 (rejected)</option>
            </select>
          </div>

          <!-- 会员等级下拉选择 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">会员组等级</label>
            <select v-model="form.download_level" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700">
              <option :value="1">免费用户 (Level 1)</option>
              <option :value="2">付费会员 (Level 2)</option>
            </select>
          </div>

          <!-- 会员到期时间：仅在等级为 Level 2 时才显性展示 -->
          <div v-if="Number(form.download_level) === 2" class="space-y-1 animate-fade-in">
            <label class="block text-xs font-bold text-gray-700 uppercase">会员到期日期 (空代表永久有效)</label>
            <input 
              v-model="form.membership_expires_date" 
              type="date" 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <!-- 管理员备注说明 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">管理员备注说明</label>
            <textarea 
              v-model="form.membership_note" 
              rows="3" 
              placeholder="输入该用户的会员开通背景或其他技术备注"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-900"
            ></textarea>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="text-xs text-red-600 font-semibold">
            ⚠ 修改失败：{{ errorMessage }}
          </div>

          <!-- 底部控制按钮 -->
          <div class="mt-6 flex space-x-3">
            <button 
              @click="showModal = false" 
              type="button" 
              class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500"
            >
              取消
            </button>
            <button 
              type="submit" 
              :disabled="submitting"
              class="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold disabled:bg-gray-300"
            >
              {{ submitting ? '正在提交...' : '确认修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 基础变量
const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const filterLevel = ref('all') // 'all', 'vip', 'free'
const errorMessage = ref('')

// 编辑表单中转模型
const activeUserId = ref('')
const form = ref({
  email: '',
  role: 'user',
  status: 'active',
  download_level: 1,
  membership_expires_date: '', // 绑定 input[type=date] 专用的 YYYY-MM-DD
  membership_note: ''
})

// 响应式分类筛选
const filteredUsers = computed(() => {
  if (filterLevel.value === 'all') return list.value
  if (filterLevel.value === 'vip') {
    return list.value.filter(u => Number(u.download_level ?? 1) >= 2)
  }
  return list.value.filter(u => Number(u.download_level ?? 1) < 2)
})

// 统一封装带 Authorization 的 Axios 管理请求头对象
const getAdminHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// 获取全部用户及会员名单 (已升级至直连自定义域名)
const fetchUsersList = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://api.urbancopilot.qzz.io/api/admin/users', getAdminHeaders())
    list.value = res.data.users || []
  } catch (err) {
    console.error('获取用户大列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 唤醒编辑 Modal 并进行预填
const openEditModal = (user) => {
  errorMessage.value = ''
  activeUserId.value = user.id
  
  // 处理 YYYY-MM-DD 日期选择格式兼容
  let expireDateStr = ''
  if (user.membership_expires_at) {
    expireDateStr = user.membership_expires_at.split('T')[0]
  }

  form.value = {
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    download_level: Number(user.download_level ?? 1),
    membership_expires_date: expireDateStr,
    membership_note: user.membership_note || ''
  }
  showModal.value = true
}

// 提交主表单修改 (多表动态合并 PUT, 已升级至自定义直连域名)
const handleSubmit = async () => {
  submitting.value = true
  try {
    let expiresAt = null
    if (Number(form.value.download_level) === 2 && form.value.membership_expires_date) {
      expiresAt = new Date(form.value.membership_expires_date).toISOString()
    }

    const payload = {
      role: form.value.role,
      status: form.value.status,
      download_level: Number(form.value.download_level),
      membership_expires_at: expiresAt,
      membership_note: form.value.membership_note
    }

    const res = await axios.put(
      `https://api.urbancopilot.qzz.io/api/admin/users/${activeUserId.value}`, 
      payload, 
      getAdminHeaders()
    )

    if (res.data.success) {
      showModal.value = false
      await fetchUsersList()
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.error || '修改失败'
  } finally {
    submitting.value = false
  }
}

// 一键开通/顺延续费时长 (使用直连自定义域名)
const quickExtend = async (user, months) => {
  try {
    let startDate = new Date()
    
    // 如果当前到期时间还没过期，在现有的基础时间上往后累加，不让用户吃亏
    if (user.membership_expires_at && !isExpired(user.membership_expires_at)) {
      startDate = new Date(user.membership_expires_at)
    }

    startDate.setMonth(startDate.getMonth() + months)
    const newExpiresAt = startDate.toISOString()

    const payload = {
      download_level: 2, // 续费快捷键自动提升至付费会员组 Level 2
      membership_expires_at: newExpiresAt,
      membership_note: `${user.membership_note || ''} | [快速续期] 顺延 ${months} 个月`.trim().replace(/^\| /, '')
    }

    const res = await axios.put(
      `https://api.urbancopilot.qzz.io/api/admin/users/${user.id}`, 
      payload, 
      getAdminHeaders()
    )

    if (res.data.success) {
      await fetchUsersList()
    }
  } catch (err) {
    alert('一键续费时长操作失败：' + (err.response?.data?.error || '网络异常'))
  }
}

// 辅助工具方法
const isExpired = (isoStr) => {
  if (!isoStr) return false
  return new Date(isoStr) < new Date()
}

const getRemainingDays = (isoStr) => {
  if (!isoStr) return 0
  const diffTime = new Date(isoStr) - new Date()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.split('T')[0]
}

// 挂载时加载
onMounted(() => {
  fetchUsersList()
})
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
.animate-pop-in { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>