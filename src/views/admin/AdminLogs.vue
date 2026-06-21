<!-- 保存路径: src/views/admin/AdminLogs.vue -->
<template>
  <div class="space-y-6 animate-fade-in bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between border-b border-gray-100 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">📝 系统管理员操作日志</h2>
        <p class="text-xs text-gray-500 mt-1">全局审计并记录所有管理员账户对数据库及账户状态执行的写入和导出操作。</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">同步操作审计流中...</p>
    </div>

    <!-- 列表数据 -->
    <div v-else class="space-y-4">
      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 text-left">执行时间</th>
              <th class="px-6 py-4 text-left">管理员账号</th>
              <th class="px-6 py-4 text-left">行为</th>
              <th class="px-6 py-4 class text-left">受控物理表</th>
              <th class="px-6 py-4 text-left">受控行ID</th>
              <th class="px-6 py-4 text-left">操作详情及入参</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-700">
            <tr v-if="logs.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                暂未有任何安全操作审计记录。
              </td>
            </tr>
            <tr v-for="log in logs" :key="code" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-400">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 font-semibold text-gray-900">{{ log.admin_email }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-0.5 rounded text-xxs font-bold bg-blue-50 text-blue-900 uppercase">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ log.target_type }}</td>
              <td class="px-6 py-4 font-mono text-gray-400 text-xxs truncate max-w-xs">{{ log.target_id || '-' }}</td>
              <!-- 详情解析区 -->
              <td class="px-6 py-4 max-w-sm">
                <pre class="bg-gray-50 p-2 rounded-lg text-xxs font-mono text-gray-600 overflow-x-auto max-h-32">{{ formatDetails(log.details) }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控制栏 -->
      <div class="flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
        <p class="text-gray-500">共检索到 {{ total }} 条审计行，当前第 {{ page }} / {{ maxPage }} 页</p>
        <div class="flex space-x-2">
          <button 
            @click="prevPage" 
            :disabled="page <= 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed font-bold"
          >
            上一页
          </button>
          <button 
            @click="nextPage" 
            :disabled="page >= maxPage"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed font-bold"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const logs = ref([])
const total = ref(0)
const page = ref(1)
const maxPage = computed(() => Math.ceil(total.value / 20) || 1)

// 同步拉取云端 D1 物理审计数据并传递安全 Token
const fetchLogs = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`https://planning-platform-api.zhuanbang111.workers.dev/api/admin/logs?page=${page.value}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    logs.value = res.data.logs || []
    total.value = res.data.total || 0
  } catch (err) {
    console.error('拉取操作日志发生异常:', err)
  } finally {
    loading.value = false
  }
}

const prevPage = async () => {
  if (page.value > 1) {
    page.value--
    await fetchLogs()
  }
}

const nextPage = async () => {
  if (page.value < maxPage.value) {
    page.value++
    await fetchLogs()
  }
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.replace('T', ' ').slice(0, 19)
}

// 高保真解析详情字段，保证不抛错、展示清晰
const formatDetails = (detailsStr) => {
  if (!detailsStr) return '{}'
  try {
    const parsed = JSON.parse(detailsStr)
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    return detailsStr
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>