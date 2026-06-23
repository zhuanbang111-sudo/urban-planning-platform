<!-- 保存路径: src/views/admin/AdminTools.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部栏 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">🔧 规划工具卡片控制台</h2>
        <p class="text-xs text-gray-500 mt-1">管理员控制：支持增加、下线或修改 tools 数据库中的模型卡片参数。</p>
      </div>
      <button 
        @click="openAddModal" 
        class="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-all"
      >
        + 新增规划工具
      </button>
    </div>

    <!-- 工具列表 -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
          <tr>
            <th class="px-6 py-4 text-left w-16">图标</th>
            <th class="px-6 py-4 text-left">工具名称</th>
            <th class="px-6 py-4 text-left">分类</th>
            <th class="px-6 py-4 text-left">运行类型</th>
            <th class="px-6 py-4 text-left">状态</th>
            <th class="px-6 py-4 text-left">最低权限</th>
            <th class="px-6 py-4 text-left">排序</th>
            <th class="px-6 py-4 text-center w-48">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-gray-700">
          <tr v-for="tool in list" :key="tool.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 text-2xl">{{ tool.icon || '🔧' }}</td>
            <td class="px-6 py-4 font-bold text-gray-950">{{ tool.name }}</td>
            <td class="px-6 py-4 text-xs text-gray-500">{{ tool.category }}</td>
            <td class="px-6 py-4 text-xs font-mono">{{ tool.tool_type }}</td>
            <!-- 状态 -->
            <td class="px-6 py-4 text-xs font-semibold">
              <span 
                :class="tool.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'" 
                class="px-2 py-0.5 rounded-full"
              >
                {{ tool.status === 'active' ? '已上架' : '已下架' }}
              </span>
            </td>
            <!-- 权限级 -->
            <td class="px-6 py-4 text-xs">
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-semibold">
                Lv.{{ tool.min_level }}
              </span>
            </td>
            <td class="px-6 py-4 text-xs font-mono">{{ tool.sort_order }}</td>
            <!-- 操作列 -->
            <td class="px-6 py-4 text-center space-x-2">
              <button @click="openEditModal(tool)" class="text-blue-950 hover:text-blue-800 text-xs font-bold">编辑</button>
              <button 
                @click="toggleStatus(tool)" 
                :class="tool.status === 'active' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'"
                class="text-xs font-bold"
              >
                {{ tool.status === 'active' ? '下架' : '上架' }}
              </button>
              <button 
                @click="handleDelete(tool.id)" 
                class="text-red-600 hover:text-red-700 text-xs font-bold"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 统一模态框弹窗 (Modal) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ isEdit ? '编辑规划工具' : '新增规划工具' }}</h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">工具名称 (必填)</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">描述说明</label>
            <textarea 
              v-model="form.description" 
              rows="2" 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            ></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">分类</label>
            <input 
              v-model="form.category" 
              type="text" 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">运行类型</label>
            <select v-model="form.tool_type" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white">
              <option value="iframe">iframe（本站内建）</option>
              <option value="iframe_external">iframe_external（外部内建）</option>
              <option value="new_window">new_window（新标签页打开）</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">运行 URL (必填)</label>
            <input 
              v-model="form.url" 
              type="text" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">图标 (Emoji)</label>
            <input 
              v-model="form.icon" 
              type="text" 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">最低权限等级 (0 = 公开, 1 = 需登录, 2 = 仅管理员)</label>
            <input 
              v-model="form.min_level" 
              type="number" 
              min="0"
              max="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">排序值 (升序)</label>
            <input 
              v-model="form.sort_order" 
              type="number" 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div class="mt-6 flex space-x-3 pt-2">
            <button @click="showModal = false" type="button" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
            <button type="submit" class="flex-1 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold">保存并部署</button>
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
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const form = ref({
  name: '',
  description: '',
  category: '排水工程',
  tool_type: 'iframe',
  url: '',
  icon: '🔧',
  min_level: 0,
  sort_order: 0
})

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

const fetchToolsList = async () => {
  try {
    const res = await axios.get('https://api.urbancopilot.qzz.io/api/admin/tools', {
      headers: getHeaders()
    })
    list.value = res.data.tools || []
  } catch (err) {
    console.error(err)
  }
}

const openAddModal = () => {
  isEdit.value = false
  editingId.value = null
  form.value = {
    name: '',
    description: '',
    category: '排水工程',
    tool_type: 'iframe',
    url: '',
    icon: '🔧',
    min_level: 0,
    sort_order: 0
  }
  showModal.value = true
}

const openEditModal = (tool) => {
  isEdit.value = true
  editingId.value = tool.id
  form.value = { ...tool }
  showModal.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`https://api.urbancopilot.qzz.io/api/admin/tools/${editingId.value}`, form.value, {
        headers: getHeaders()
      })
    } else {
      await axios.post('https://api.urbancopilot.qzz.io/api/admin/tools', form.value, {
        headers: getHeaders()
      })
    }
    showModal.value = false
    await fetchToolsList()
  } catch (err) {
    alert(err.response?.data?.error || '操作异常')
  }
}

const toggleStatus = async (tool) => {
  const newStatus = tool.status === 'active' ? 'inactive' : 'active'
  try {
    await axios.put(`https://api.urbancopilot.qzz.io/api/admin/tools/${tool.id}`, {
      status: newStatus
    }, {
      headers: getHeaders()
    })
    await fetchToolsList()
  } catch (err) {
    alert('上架状态变更失败')
  }
}

const handleDelete = async (id) => {
  if (confirm('警告：此操作不可恢复，确定要永久删除该规划工具及其中所有的运行轨迹吗？')) {
    try {
      await axios.delete(`https://api.urbancopilot.qzz.io/api/admin/tools/${id}`, {
        headers: getHeaders()
      })
      await fetchToolsList()
    } catch (err) {
      alert('工具删除失败')
    }
  }
}

onMounted(() => {
  fetchToolsList()
})
</script>