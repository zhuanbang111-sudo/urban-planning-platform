<!-- 保存路径: src/views/admin/AdminApplications.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部栏 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">注册申请审批</h2>
        <p class="text-xs text-gray-500 mt-1">处理人工通道提报的规划从业科研学者账户的准入和级联授信。</p>
      </div>
      <div v-if="pendingCount > 0" class="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black animate-bounce">
        {{ pendingCount }} 待审批
      </div>
    </div>

    <!-- 状态过滤 Tab 栏 -->
    <div class="flex space-x-2 border-b border-gray-100 pb-2">
      <button 
        v-for="tab in filterTabs" 
        :key="tab.status"
        @click="currentStatus = tab.status"
        :class="[
          currentStatus === tab.status 
            ? 'bg-blue-900 text-white font-bold' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        ]"
        class="px-4 py-1.5 rounded-lg text-xs transition-all"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">同步审核队列中...</p>
    </div>

    <!-- 占位空态 -->
    <div v-else-if="filteredApps.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <span class="text-4xl">📋</span>
      <h3 class="text-base font-bold text-gray-700 mt-4">该队列下空空如也</h3>
    </div>

    <!-- 列表网格 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="app in filteredApps" 
        :key="app.id"
        class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div class="space-y-4">
          <!-- 上方信息：姓名圆形头像 -->
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner" :style="{ backgroundColor: getAvatarColor(app.apply_name) }">
              {{ app.apply_name?.slice(0, 1) || '👤' }}
            </div>
            <div>
              <h4 class="text-base font-bold text-gray-900">{{ app.apply_name }}</h4>
              <p class="text-xs text-gray-400 font-mono">{{ app.email }}</p>
            </div>
          </div>

          <!-- 中部单位标签 -->
          <div class="flex">
            <span class="px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-900">
              🏢 {{ app.apply_org }}
            </span>
          </div>

          <!-- 申请诉求 -->
          <div class="p-3 bg-gray-50 rounded-lg text-xs italic text-gray-600 leading-relaxed border-l-2 border-gray-300">
            "{{ app.apply_reason || '暂未填写具体说明。' }}"
          </div>
        </div>

        <!-- 底部控制与时间 -->
        <div class="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
          <span class="text-xxs text-gray-400">{{ formatDate(app.created_at) }}</span>
          
          <!-- 操作按钮：仅 pending 状态暴露 -->
          <div v-if="app.status === 'pending'" class="flex space-x-2">
            <button 
              @click="openApproveModal(app)" 
              class="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs font-bold transition-all"
            >
              ✓ 通过
            </button>
            <button 
              @click="openRejectModal(app)" 
              class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition-all"
            >
              ✗ 拒绝
            </button>
          </div>
          
          <!-- 静态状态标记 -->
          <div v-else>
            <span 
              :class="app.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'" 
              class="px-2.5 py-1 rounded text-xs font-bold"
            >
              {{ app.status === 'active' ? '已批准可用' : '已拒绝驳回' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 1：批准通过确认弹窗 -->
    <div v-if="showApproveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">确认批准该申请？</h3>
        <p class="text-xs text-gray-500 mt-2 leading-relaxed">
          核准 **{{ targetApp?.apply_name }}** ({{ targetApp?.apply_org }}) 的注册。通过后，系统将自动分配 1 级下载权限并发送邮件，使其可立即登录。
        </p>
        <div class="mt-6 flex space-x-3">
          <button @click="showApproveModal = false" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
          <button @click="confirmApprove" class="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold">确认通过</button>
        </div>
      </div>
    </div>

    <!-- 弹窗 2：拒绝申请弹窗 -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">请填写拒绝说明</h3>
        <p class="text-xs text-gray-500 mt-1">此原因将被归档，拒绝后用户登录将获得针对性告知。</p>
        <textarea 
          v-model="rejectReason" 
          rows="3" 
          placeholder="选填，例如：单位资质未核实、未填报真实姓名等"
          class="w-full mt-4 p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500"
        ></textarea>
        <div class="mt-6 flex space-x-3">
          <button @click="showRejectModal = false" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
          <button @click="confirmReject" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">确认拒绝</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getApplications, approveApplication, rejectApplication } from '../../utils/api'

const loading = ref(false)
const list = ref([])
const currentStatus = ref('pending') // 'pending', 'active', 'rejected'

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const targetApp = ref(null)
const rejectReason = ref('')

const filterTabs = [
  { name: '全部申请', status: '' },
  { name: '待审核 🔴', status: 'pending' },
  { name: '已通过 ✅', status: 'active' },
  { name: '已拒绝 ❌', status: 'rejected' }
]

const filteredApps = computed(() => {
  if (!currentStatus.value) return list.value
  return list.value.filter(item => item.status === currentStatus.value)
})

const pendingCount = computed(() => {
  return list.value.filter(item => item.status === 'pending').length
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getApplications()
    list.value = res.applications || []
  } catch (err) {
    console.error('获取列表异常：', err)
  } finally {
    loading.value = false
  }
}

// 批准控制
const openApproveModal = (app) => {
  targetApp.value = app
  showApproveModal.value = true
}

const confirmApprove = async () => {
  if (!targetApp.value) return
  try {
    const res = await approveApplication(targetApp.value.id)
    if (res.success) {
      showApproveModal.value = false
      await fetchList()
    }
  } catch (err) {
    alert('操作发生异常')
  }
}

// 拒绝控制
const openRejectModal = (app) => {
  targetApp.value = app
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!targetApp.value) return
  try {
    const res = await rejectApplication(targetApp.value.id, rejectReason.value)
    if (res.success) {
      showRejectModal.value = false
      await fetchList()
    }
  } catch (err) {
    alert('操作发生异常')
  }
}

// 辅助渲染色
const getAvatarColor = (name) => {
  if (!name) return '#cbd5e1'
  const colors = ['#1e3a5f', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.split('T')[0] + ' ' + isoStr.split('T')[1].slice(0, 5)
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
</style>