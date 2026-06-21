<!-- 保存路径: src/views/admin/AdminApplications.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部栏 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">注册申请审批</h2>
        <p class="text-xs text-gray-500 mt-1">处理人工通道提报的规划从业科研学者账户的准入和级联授信。</p>
      </div>
    </div>

    <!-- 状态过滤 Tab 栏 -->
    <div class="flex space-x-2 border-b border-gray-100 pb-2 overflow-x-auto whitespace-nowrap">
      <button 
        v-for="tab in filterTabs" 
        :key="tab.status"
        @click="handleTabChange(tab.status)"
        :class="[
          currentStatus === tab.status 
            ? 'bg-blue-900 text-white font-bold' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        ]"
        class="px-4 py-2 rounded-lg text-xs transition-all focus:outline-none"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">同步审核队列中...</p>
    </div>

    <!-- 空状态占位 -->
    <div v-else-if="list.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <span class="text-4xl">📋</span>
      <h3 class="text-base font-bold text-gray-700 mt-4">暂无符合条件的申请记录</h3>
      <p class="text-xs text-gray-400 mt-1">当前队列中没有未处理或符合该状态的审核记录。</p>
    </div>

    <!-- 数据列表（表格） -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 text-left">申请人邮箱</th>
              <th class="px-6 py-4 text-left w-28">真实姓名</th>
              <th class="px-6 py-4 text-left">所在单位</th>
              <th class="px-6 py-4 text-left max-w-xs">申请诉求</th>
              <th class="px-6 py-4 text-left w-24">状态</th>
              <th class="px-6 py-4 text-left">申请时间</th>
              <th class="px-6 py-4 text-center w-36">管理操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-700">
            <tr v-for="app in list" :key="app.id" class="hover:bg-gray-50/50 transition-colors">
              <!-- 邮箱 -->
              <td class="px-6 py-4 font-mono font-medium text-gray-900">{{ app.email }}</td>
              
              <!-- 真实姓名 -->
              <td class="px-6 py-4 font-semibold text-gray-950">{{ app.apply_name }}</td>
              
              <!-- 单位 -->
              <td class="px-6 py-4 text-xs font-semibold text-gray-600">{{ app.apply_org }}</td>
              
              <!-- 理由 (截断+悬浮展示) -->
              <td class="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" :title="app.apply_reason || '未填写具体说明'">
                {{ app.apply_reason || '-' }}
              </td>

              <!-- 状态标签 -->
              <td class="px-6 py-4 text-xs font-semibold">
                <span v-if="app.status === 'pending'" class="text-orange-700 bg-orange-50 px-2 py-0.5 rounded">待审核</span>
                <span v-else-if="app.status === 'active'" class="text-green-700 bg-green-50 px-2 py-0.5 rounded">已通过</span>
                <span v-else class="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">已拒绝</span>
              </td>

              <!-- 申请时间 -->
              <td class="px-6 py-4 text-xs text-gray-400 font-mono">{{ formatDate(app.created_at) }}</td>

              <!-- 操作按钮 -->
              <td class="px-6 py-4 text-center">
                <div v-if="app.status === 'pending'" class="flex justify-center space-x-2">
                  <button 
                    @click="handleApprove(app.id)" 
                    class="px-2.5 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs font-bold transition-all"
                  >
                    批准
                  </button>
                  <button 
                    @click="handleReject(app.id)" 
                    class="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-all"
                  >
                    拒绝
                  </button>
                </div>
                <span v-else class="text-xs text-gray-400 font-semibold">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const list = ref([])
const currentStatus = ref('pending') // 默认载入“待审核”

const filterTabs = [
  { name: '全部', status: '' },
  { name: '待审核 🔴', status: 'pending' },
  { name: '已通过 ✅', status: 'active' },
  { name: '已拒绝 ❌', status: 'rejected' }
]

// 统一封装管理端带 token 请求头
const getAdminHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// 分类拉取申请列表 (直连 api.urbancopilot.qzz.io 网域)
const fetchApplications = async () => {
  loading.value = true
  try {
    const statusQuery = currentStatus.value ? `?status=${currentStatus.value}` : ''
    const res = await axios.get(
      `https://api.urbancopilot.qzz.io/api/admin/applications${statusQuery}`, 
      getAdminHeaders()
    )
    list.value = res.data.applications || []
  } catch (err) {
    console.error('拉取申请队列异常:', err)
  } finally {
    loading.value = false
  }
}

// 切换 Tab
const handleTabChange = async (status) => {
  currentStatus.value = status
  await fetchApplications()
}

// 批准申请
const handleApprove = async (id) => {
  try {
    const res = await axios.patch(
      `https://api.urbancopilot.qzz.io/api/admin/applications/${encodeURIComponent(id)}/approve`, 
      null, 
      getAdminHeaders()
    )
    if (res.data.success) {
      await fetchApplications()
    }
  } catch (err) {
    alert('操作发生错误：' + (err.response?.data?.error || '网络访问超时'))
  }
}

// 拒绝申请 (带 prompt 机制)
const handleReject = async (id) => {
  const reason = prompt('请输入拒绝该用户注册申请的原因（选填）：')
  if (reason === null) return // 点击取消中断

  try {
    const res = await axios.patch(
      `https://api.urbancopilot.qzz.io/api/admin/applications/${encodeURIComponent(id)}/reject`, 
      { reason: reason.trim() }, 
      getAdminHeaders()
    )
    if (res.data.success) {
      await fetchApplications()
    }
  } catch (err) {
    alert('操作发生错误：' + (err.response?.data?.error || '网络访问超时'))
  }
}

// 时间转换器
const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const datePart = isoStr.split('T')[0]
  const timePart = isoStr.split('T')[1]?.slice(0, 5) || ''
  return `${datePart} ${timePart}`
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
</style>