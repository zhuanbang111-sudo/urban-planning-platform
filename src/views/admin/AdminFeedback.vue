<!-- 保存路径: src/views/admin/AdminFeedback.vue -->
<template>
  <div class="space-y-6">
    <!-- 顶部标题区域 -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <span>💡</span>
          <span>建议反馈管理</span>
        </h1>
        <p class="text-sm text-gray-500 mt-1">查看并跟进用户提交的系统优化建议及平台反馈</p>
      </div>
    </div>

    <!-- 顶部状态筛选标签卡片 -->
    <div class="border border-gray-100 bg-white p-2 rounded-xl shadow-sm flex flex-wrap gap-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        @click="currentTab = tab.value"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
          currentTab === tab.value 
            ? 'bg-[#1e3a5f] text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 加载等待状态 -->
    <div v-if="loading" class="flex justify-center items-center py-16 bg-white rounded-xl shadow border border-gray-100">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-500 text-sm">正在加载建议列表...</span>
    </div>

    <!-- 加载失败错误显示 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center shadow-sm">
      <span class="text-lg mr-2">⚠️</span> {{ error }}
      <button @click="fetchFeedback" class="ml-4 underline hover:text-red-900 font-semibold">重新尝试</button>
    </div>

    <!-- 空数据提示 -->
    <div v-else-if="feedbackList.length === 0" class="bg-white rounded-xl shadow border border-gray-100 p-16 text-center text-gray-400">
      <span class="text-5xl block mb-3">📭</span>
      <p class="text-base font-medium">暂无对应的建议反馈数据</p>
    </div>

    <!-- 反馈列表表格 -->
    <div v-else class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/70 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">提交人邮箱</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider max-w-md">建议内容 (悬停查看全部)</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">当前状态</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">管理员备注</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">提交时间</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">管理操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in feedbackList" :key="item.id" class="hover:bg-gray-50/50 transition-all duration-150">
              <!-- 用户邮箱 -->
              <td class="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                {{ item.user_email }}
              </td>
              
              <!-- 建议内容：超过50字截断 + 鼠标悬停显示完整内容 -->
              <td class="px-6 py-4 text-sm text-gray-600 max-w-md">
                <span 
                  :title="item.content" 
                  class="cursor-help block break-all hover:text-blue-900 hover:underline transition-colors duration-150"
                >
                  {{ item.content && item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content }}
                </span>
              </td>
              
              <!-- 状态标签 -->
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <span 
                  :class="getStatusClass(item.status)" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDotClass(item.status)"></span>
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              
              <!-- 管理员备注 -->
              <td class="px-6 py-4 text-sm text-gray-500">
                <span :class="item.admin_note ? 'text-gray-800 font-normal' : 'text-gray-400 italic'">
                  {{ item.admin_note || '-' }}
                </span>
              </td>
              
              <!-- 提交时间 -->
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {{ formatDate(item.created_at) }}
              </td>
              
              <!-- 操作列 -->
              <td class="px-6 py-4 text-sm text-right space-x-2 whitespace-nowrap">
                <!-- 标记已查看：new 状态下显示 -->
                <button 
                  v-if="item.status === 'new'"
                  @click="updateFeedbackStatus(item.id, 'reviewed')"
                  class="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                >
                  标记已查看
                </button>
                
                <!-- 标记关闭：reviewed 状态下显示 -->
                <button 
                  v-if="item.status === 'reviewed'"
                  @click="updateFeedbackStatus(item.id, 'closed')"
                  class="bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                >
                  标记关闭
                </button>
                
                <!-- 备注按钮：始终显示，点击拉起浏览器内置 prompt -->
                <button 
                  @click="handleEditNote(item)"
                  class="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                >
                  备注
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// API 接口基准地址
const API_BASE = 'https://api.urbancopilot.qzz.io'

// 列表与状态追踪
const feedbackList = ref([])
const loading = ref(false)
const error = ref(null)
const currentTab = ref('all')

// 选项卡定义列表
const tabs = [
  { label: '全部建议', value: 'all' },
  { label: '待处理 (new)', value: 'new' },
  { label: '已查看 (reviewed)', value: 'reviewed' },
  { label: '已关闭 (closed)', value: 'closed' }
]

// 封装获取鉴权头部信息的方法，确保每次调用时获取最新的 Token
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// 1. 获取建议反馈数据列表
const fetchFeedback = async () => {
  loading.value = true
  error.value = null
  try {
    let url = `${API_BASE}/api/admin/feedback`
    if (currentTab.value !== 'all') {
      url += `?status=${currentTab.value}`
    }
    
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!res.ok) {
      throw new Error(`请求失败，状态码: ${res.status}`)
    }
    
    const data = await res.json()
    // 兼容可能出现的包装结构（如果有 code/data 包装则解析，否则直接赋值）
    feedbackList.value = Array.isArray(data) ? data : (data.data || [])
  } catch (err) {
    console.error('获取反馈错误:', err)
    error.value = '无法载入反馈数据，请确认您的网络及管理员登录状态。'
  } finally {
    loading.value = false
  }
}

// 2. 修改建议的状态 (new -> reviewed / reviewed -> closed)
const updateFeedbackStatus = async (id, newStatus) => {
  const confirmMsg = newStatus === 'reviewed' ? '确定要将该条建议标记为“已查看”吗？' : '确定要关闭该条反馈吗？'
  if (!confirm(confirmMsg)) return

  try {
    const res = await fetch(`${API_BASE}/api/admin/feedback/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: newStatus })
    })

    if (!res.ok) {
      throw new Error('更新状态失败')
    }

    alert('状态更新成功')
    await fetchFeedback()
  } catch (err) {
    alert(err.message)
  }
}

// 3. 填写/修改管理员备注信息
const handleEditNote = async (item) => {
  const note = prompt('请输入管理员备注信息：', item.admin_note || '')
  if (note === null) return // 玩家点击了“取消”

  try {
    const res = await fetch(`${API_BASE}/api/admin/feedback/${idHelper(item)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ admin_note: note.trim() })
    })

    if (!res.ok) {
      throw new Error('保存备注失败')
    }

    alert('备注更新成功')
    await fetchFeedback()
  } catch (err) {
    alert(err.message)
  }
}

// 获取实体 id 的兜底辅助器
const idHelper = (item) => {
  return item.id || item._id
}

// 4. 辅助视觉渲染解析
const getStatusClass = (status) => {
  switch (status) {
    case 'new':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'reviewed':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'closed':
      return 'bg-gray-50 text-gray-500 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-500 border-gray-200'
  }
}

const getStatusDotClass = (status) => {
  switch (status) {
    case 'new':
      return 'bg-orange-500'
    case 'reviewed':
      return 'bg-blue-500'
    case 'closed':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'new': return '待处理'
    case 'reviewed': return '已查看'
    case 'closed': return '已关闭'
    default: return status || '未知'
  }
}

// 日期时间简单格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch (e) {
    return dateStr
  }
}

// 监听 Tab 筛选变化，自动刷新列表
watch(currentTab, () => {
  fetchFeedback()
})

// 组件加载时立即请求数据
onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
/* 保证备注和文本在较长时可正常折行 */
.break-all {
  word-break: break-all;
}
</style>