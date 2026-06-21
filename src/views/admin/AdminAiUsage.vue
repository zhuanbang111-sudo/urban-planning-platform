<!-- 保存路径: src/views/admin/AdminAiUsage.vue -->
<template>
  <div class="space-y-6 animate-fade-in bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between border-b border-gray-100 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">📈 用户 AI 用量监测及额度</h2>
        <p class="text-xs text-gray-500 mt-1">实时计算平台内用户的今日 AI 接口调用总量、额度充值剩余周期及物理下载等级。</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">汇编云端用量指标中...</p>
    </div>

    <!-- 数据表格 -->
    <div v-else class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="min-w-full divide-y divide-gray-200 text-xs">
        <thead class="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4 text-left">核定用户账号</th>
            <th class="px-6 py-4 text-left">今日已调用 AI 频次</th>
            <th class="px-6 py-4 text-left">频次周期重设日期</th>
            <th class="px-6 py-4 text-left">用户物理下载等级</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-gray-700">
          <tr v-if="usageList.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-400">
              暂未检测到任何账号产生调用指标。
            </td>
          </tr>
          <tr v-for="user in usageList" :key="user.email" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 font-semibold text-gray-900">{{ user.email }}</td>
            <!-- 用量突出展示 -->
            <td class="px-6 py-4 font-mono font-bold text-sm" :class="user.ai_calls_today > 10 ? 'text-red-600' : 'text-blue-900'">
              {{ user.ai_calls_today }} 次
            </td>
            <td class="px-6 py-4 text-gray-400 font-mono">{{ user.ai_reset_date || '-' }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded text-xxs font-bold bg-green-50 text-green-800">
                Level {{ user.download_level }} 级权限
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const usageList = ref([])

const fetchUsage = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get('https://planning-platform-api.zhuanbang111.workers.dev/api/admin/ai-usage', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    usageList.value = res.data.usage || []
  } catch (err) {
    console.error('AI用量统计数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsage()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>