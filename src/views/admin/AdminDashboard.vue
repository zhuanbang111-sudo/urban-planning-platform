<!-- 保存路径: src/views/admin/AdminDashboard.vue -->
<template>
  <div class="space-y-6">
    <div class="border-b border-gray-200 pb-4 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-gray-800">📊 数据统计仪表盘</h2>
        <p class="text-xs text-gray-500 mt-1">系统资源运行状态、用户入驻趋势及 AI 调用限额大盘。</p>
      </div>
    </div>

    <!-- 5卡片指标网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      
      <!-- 1. 总用户 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-gray-400">
          <span class="text-xs font-bold uppercase">总注册用户</span>
          <span class="text-xl">👥</span>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ stats.totalUsers }} 人</p>
      </div>

      <!-- 2. 今日新增 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-gray-400">
          <span class="text-xs font-bold uppercase">今日新增注册</span>
          <span class="text-xl">🌱</span>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ stats.todayRegistrations }} 人</p>
      </div>

      <!-- 3. 待审核申请 (带醒目控制) -->
      <div 
        @click="goToApplications"
        :class="[
          stats.pendingApprovals > 0 
            ? 'border-red-300 bg-red-50/20 cursor-pointer hover:shadow-md transition-all' 
            : 'border-gray-200 bg-white'
        ]"
        class="border rounded-2xl p-5 shadow-sm space-y-2"
      >
        <div class="flex items-center justify-between text-gray-400">
          <span class="text-xs font-bold uppercase" :class="stats.pendingApprovals > 0 ? 'text-red-600 font-extrabold' : ''">待审批申请</span>
          <span class="text-xl" :class="stats.pendingApprovals > 0 ? 'animate-bounce' : ''">🔔</span>
        </div>
        <p class="text-2xl font-black" :class="stats.pendingApprovals > 0 ? 'text-red-600' : 'text-gray-900'">
          {{ stats.pendingApprovals }} 件
        </p>
      </div>

      <!-- 4. 工具调用总数 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-gray-400">
          <span class="text-xs font-bold uppercase">计算工具总调用</span>
          <span class="text-xl">📊</span>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ stats.totalToolCalls }} 次</p>
      </div>

      <!-- 5. 有效邀请码数量 -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">有效邀请码数</p>
        <p class="text-3xl font-extrabold text-blue-900">{{ stats.activeInviteCodes }} 个</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  todayRegistrations: 0,
  pendingApprovals: 0,
  totalToolCalls: 0,
  activeInviteCodes: 0
})

const pendingCount = computed(() => stats.value.pendingApprovals)

const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('https://planning-platform-api.zhuanbang111.workers.dev/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = res.data
  } catch (err) {
    console.error('拉取大屏指标发生错误：', err)
  } finally {
    loading.value = false
  }
}

const openApproveModal = (app) => {
  router.push('/admin/applications')
}

onMounted(() => {
  fetchList()
})
</script>