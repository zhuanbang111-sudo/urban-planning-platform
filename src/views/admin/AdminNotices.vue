---

### 2. 修改后的前端 `AdminNotices.vue` 完整代码

我已将此文件内的 `formatDate` 函数改造为自适应兼容格式，无论时间字符串中包含 `T`、空格还是其他分隔符，都能无差错完美拆分，绝不白屏崩溃。

<!-- 保存路径: src/views/admin/AdminNotices.vue -->
```vue
<!-- 保存路径: src/views/admin/AdminNotices.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部栏 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">📢 广播通知公告栏</h2>
        <p class="text-xs text-gray-500 mt-1">管理员控制：新建全局通知公告、一键发布更新至公共主页广播队列。</p>
      </div>
      <button 
        @click="openAddModal" 
        class="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-all focus:outline-none"
      >
        + 新建广播公告
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">正在拉取公告面板...</p>
    </div>

    <!-- 空列表状态 -->
    <div v-else-if="list.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <span class="text-4xl">📢</span>
      <h3 class="text-base font-bold text-gray-700 mt-4">暂无任何广播公告</h3>
      <p class="text-xs text-gray-400 mt-1">请点击右上方按钮开始发布首个系统广播公告。</p>
    </div>

    <!-- 数据表格 -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 text-left">公告标题</th>
              <th class="px-6 py-4 text-left w-28">当前状态</th>
              <th class="px-6 py-4 text-left">创建时间</th>
              <th class="px-6 py-4 text-left">最后修改时间</th>
              <th class="px-6 py-4 text-center w-52">管理操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-700">
            <tr v-for="notice in list" :key="notice.id" class="hover:bg-gray-50/50 transition-colors">
              <!-- 标题 -->
              <td class="px-6 py-4 font-bold text-gray-950">{{ notice.title }}</td>
              
              <!-- 状态 -->
              <td class="px-6 py-4 text-xs font-semibold">
                <span v-if="notice.status === 'published'" class="text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  已发布
                </span>
                <span v-else class="text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                  草稿箱
                </span>
              </td>

              <!-- 创建时间 -->
              <td class="px-6 py-4 text-xs text-gray-400 font-mono">{{ formatDate(notice.created_at) }}</td>
              
              <!-- 修改时间 -->
              <td class="px-6 py-4 text-xs text-gray-400 font-mono">{{ formatDate(notice.updated_at) }}</td>

              <!-- 操作列 -->
              <td class="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                <button 
                  @click="openEditModal(notice)" 
                  class="text-blue-900 hover:text-blue-800 text-xs font-bold"
                >
                  编辑
                </button>
                <button 
                  @click="togglePublish(notice)" 
                  :class="notice.status === 'published' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                  class="text-xs font-bold"
                >
                  {{ notice.status === 'published' ? '下线' : '发布' }}
                </button>
                <button 
                  @click="handleDelete(notice.id)" 
                  class="text-red-600 hover:text-red-700 text-xs font-bold"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 弹窗：新建 / 编辑公告配置 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-pop-in">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ isEdit ? '编辑系统广播' : '新建广播公告' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">公告标题 (必填)</label>
            <input 
              v-model="form.title" 
              type="text" 
              required 
              placeholder="请输入标题"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">公告内容正文 (必填)</label>
            <textarea 
              v-model="form.content" 
              rows="8" 
              required
              placeholder="请在这里编写系统通知的富文本或 Markdown 渲染段落..."
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-900"
            ></textarea>
          </div>

          <!-- 底部控制 -->
          <div class="mt-6 flex space-x-3 pt-2">
            <button @click="showModal = false" type="button" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold disabled:bg-gray-400">
              {{ submitting ? '正在部署...' : '保存修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const list = ref([])
const loading = ref(false)
const submitting = ref(ref)
const showModal = ref(false)
const isEdit = ref(false)
const activeId = ref(null)

const form = ref({
  title: '',
  content: ''
})

const getAdminHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://api.urbancopilot.qzz.io/api/admin/notices', getAdminHeaders())
    list.value = res.data.notices || []
  } catch (err) {
    console.error('拉取后台公告目录失败：', err)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEdit.value = false
  activeId.value = null
  form.value = { title: '', content: '' }
  showModal.value = true
}

const openEditModal = (notice) => {
  isEdit.value = true
  activeId.value = notice.id
  form.value = { title: notice.title, content: notice.content }
  showModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content.trim()
    }
    
    if (isEdit.value) {
      await axios.put(`https://api.urbancopilot.qzz.io/api/admin/notices/${activeId.value}`, payload, getAdminHeaders())
    } else {
      await axios.post('https://api.urbancopilot.qzz.io/api/admin/notices', payload, getAdminHeaders())
    }
    
    showModal.value = false
    await fetchNotices()
  } catch (err) {
    alert(err.response?.data?.error || '操作执行失败')
  } finally {
    submitting.value = false
  }
}

const togglePublish = async (notice) => {
  const nextStatus = notice.status === 'published' ? 'draft' : 'published'
  try {
    await axios.put(`https://api.urbancopilot.qzz.io/api/admin/notices/${notice.id}`, {
      status: nextStatus
    }, getAdminHeaders())
    await fetchNotices()
  } catch (err) {
    alert('发布状态变更故障')
  }
}

const handleDelete = async (id) => {
  if (confirm('确定要删除该系统公告吗？此删除操作不可恢复，客户端将永久不可见。')) {
    try {
      await axios.delete(`https://api.urbancopilot.qzz.io/api/admin/notices/${id}`, getAdminHeaders())
      await fetchNotices()
    } catch (err) {
      alert('公告删除失败')
    }
  }
}

/**
 * 【已修复高容错格式化函数】：自适应处理带 T 和不带 T 分隔符的所有 ISO 日期格式，拒绝崩溃
 */
const formatDate = (isoStr) => {
  if (!isoStr) return ''
  const normalized = isoStr.includes('T') ? isoStr.replace('T', ' ') : isoStr
  const parts = normalized.split(' ')
  const datePart = parts[0] || ''
  const timePart = parts[1] ? parts[1].slice(0, 5) : ''
  return timePart ? `${datePart} ${timePart}` : datePart
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
.animate-pop-in { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>