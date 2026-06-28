<!-- 保存路径: src/views/admin/AdminKnowledge.vue -->
<template>
  <div class="space-y-6">
    <!-- 顶部状态面板 -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <span>💡</span>
          <span>知识库管理</span>
        </h1>
        <p class="text-sm text-gray-500 mt-1">上传、修改及下架规划教案、研究课题与学术讲座文件</p>
      </div>
      <div>
        <button 
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>上传新知识</span>
        </button>
      </div>
    </div>

    <!-- 列表加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-20 bg-white rounded-xl shadow border border-gray-100">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-500 text-sm">正在加载知识数据...</span>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="resources.length === 0" class="bg-white rounded-xl shadow border border-gray-100 p-20 text-center text-gray-400">
      <span class="text-5xl block mb-3">📂</span>
      <p class="text-base font-medium">暂无相关的知识数据，请先点击右上角上传知识文件</p>
    </div>

    <!-- 数据表格 -->
    <div v-else class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">标识</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">知识名称</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">分类</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">发布日期</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">关联文件名</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">大小</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">查看等级</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">预览价</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">下载价</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">状态</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">管理操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="item in resources" :key="item.id" class="hover:bg-gray-50/50 transition-all duration-150">
              <!-- 标识 -->
              <td class="px-6 py-4 text-center text-lg whitespace-nowrap">💡</td>
              <!-- 标题 -->
              <td class="px-6 py-4 text-sm font-semibold text-gray-800 max-w-xs truncate" :title="item.title">
                {{ item.title }}
              </td>
              <!-- 分类 -->
              <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{{ item.category || '未分类' }}</td>
              <!-- 发布日期 -->
              <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{{ item.document_date || '-' }}</td>
              <!-- 文件名 -->
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="item.file_name">
                <span v-if="item.source_type === 'external'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                  🔗 外部链接
                </span>
                <span v-else>
                  {{ item.file_name || '-' }}
                </span>
              </td>
              <!-- 大小 -->
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                {{ item.source_type === 'external' ? '-' : formatFileSize(item.file_size) }}
              </td>
              <!-- 等级 -->
              <td class="px-6 py-4 text-sm whitespace-nowrap">
                <span :class="getLevelClass(item.min_level)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs">
                  {{ getLevelText(item.min_level) }}
                </span>
              </td>
              <!-- 预览价格 -->
              <td class="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">{{ formatPrice(item.view_price) }}</td>
              <!-- 下载价格 -->
              <td class="px-6 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                {{ item.source_type === 'external' ? '-' : formatPrice(item.download_price) }}
              </td>
              <!-- 状态 -->
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <span :class="item.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs">
                  {{ item.status === 'active' ? '已上架' : '已下架' }}
                </span>
              </td>
              <!-- 操作 -->
              <td class="px-6 py-4 text-sm text-right space-x-2 whitespace-nowrap">
                <button @click="handlePreview(item)" class="text-blue-600 hover:text-blue-800 font-semibold text-xs">预览</button>
                <button @click="openEditModal(item)" class="text-yellow-600 hover:text-yellow-800 font-semibold text-xs">编辑</button>
                <button @click="toggleStatus(item)" :class="item.status === 'active' ? 'text-gray-500 hover:text-gray-700' : 'text-green-600 hover:text-green-800'" class="font-semibold text-xs">
                  {{ item.status === 'active' ? '下架' : '上架' }}
                </button>
                <button @click="openPurchasesModal(item)" class="text-indigo-600 hover:text-indigo-800 font-semibold text-xs">购买记录</button>
                <button @click="handleDelete(item.id)" class="text-red-600 hover:text-red-800 font-semibold text-xs">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 上传/编辑资源 Modal 弹窗 -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 p-6 space-y-4">
        <div class="flex justify-between items-center border-b pb-3">
          <h3 class="text-lg font-bold text-gray-800">{{ isEdit ? '✏️ 编辑知识内容' : '📤 上传新知识文件' }}</h3>
          <button @click="showFormModal = false" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- 标题 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">知识标题 *</label>
            <input v-model="form.title" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入研究教案或课题名称">
          </div>

          <!-- 内容来源选择 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">内容来源 *</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="form.source_type = 'upload'"
                :class="form.source_type === 'upload' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20' : 'bg-gray-50 border-gray-300 text-gray-600'"
                class="flex items-center justify-center gap-2 py-2 border rounded-lg text-sm font-semibold transition-all"
              >
                <span>📤</span> 上传文件
              </button>
              <button 
                type="button"
                @click="form.source_type = 'external'"
                :class="form.source_type === 'external' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20' : 'bg-gray-50 border-gray-300 text-gray-600'"
                class="flex items-center justify-center gap-2 py-2 border rounded-lg text-sm font-semibold transition-all"
              >
                <span>🔗</span> 外部链接
              </button>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">描述与简介</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请简要描述本份规划研究课件的主要研究价值与方向"></textarea>
          </div>

          <!-- 分类与查看等级 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">分类名称</label>
              <select v-model="categorySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">请选择已有分类 (不选为未分类)</option>
                <option v-for="cat in existingCategories" :key="cat" :value="cat">{{ cat }}</option>
                <option value="__custom__">➕ 自定义新分类...</option>
              </select>
              <input 
                v-if="categorySelect === '__custom__'"
                v-model="categoryCustom" 
                type="text" 
                required
                class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="如：低碳规划课题、专家专题讲堂"
              >
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">查看等级门槛</label>
              <select v-model.number="form.min_level" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="0">公开免费</option>
                <option :value="1">登录免费用户可看</option>
                <option :value="2">仅会员免费 (非会员需付费)</option>
              </select>
            </div>
          </div>

          <!-- 文件发布日期 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">文件发布日期（选填）</label>
            <input v-model="form.document_date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
          </div>

          <!-- 价格体系 -->
          <div :class="form.source_type === 'external' ? 'grid-cols-1' : 'grid-cols-2'" class="grid gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">
                查看价格 (元)
              </label>
              <input v-model.number="form.view_price_yuan" type="number" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <span class="text-[10px] text-gray-400 mt-1 block">0表示免费，单位：元</span>
            </div>
            <div v-if="form.source_type === 'upload'">
              <label class="block text-xs font-bold text-gray-700 mb-1">
                下载价格 (元)
              </label>
              <input v-model.number="form.download_price_yuan" type="number" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <span class="text-[10px] text-gray-400 mt-1 block">0表示免费，单位：元</span>
            </div>
          </div>

          <!-- 物理文件上传区域 / 外部链接输入框 -->
          <div class="border-t pt-4">
            <div v-if="form.source_type === 'upload'">
              <label class="block text-xs font-bold text-gray-700 mb-1">
                知识关联文件 {{ isEdit ? '(选填)' : '*' }}
              </label>
              <input 
                type="file" 
                @change="handleFileChange" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" 
                :required="!isEdit"
                class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              >
              <span class="text-[10px] text-gray-400 block mt-1">支持格式: .pdf, .doc, .docx, .jpg, .png，且单文件限制大小 30MB 字节。</span>
            </div>
            <div v-else>
              <label class="block text-xs font-bold text-gray-700 mb-1">
                外部链接地址 *
              </label>
              <input 
                v-model="form.external_url" 
                type="url" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="https://example.com/document"
              >
              <span class="text-[10px] text-gray-400 block mt-1">请输入以 http:// 或 https:// 开头的有效外部链接。</span>
            </div>
          </div>

          <!-- 底部控制按钮 -->
          <div class="flex justify-end space-x-3 border-t pt-3">
            <button type="button" @click="showFormModal = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">取消</button>
            <button type="submit" class="px-5 py-2 text-sm text-white bg-[#1e3a5f] hover:bg-blue-900 rounded-lg shadow font-semibold">保存提交</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 特许永久订单授权管理 Modal -->
    <div v-if="showPurchasesModal" class="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 p-6 flex flex-col max-h-[90vh]">
        <div class="flex justify-between items-center border-b pb-3 flex-shrink-0">
          <div>
            <h3 class="text-lg font-bold text-gray-800">🔑 购买记录与特许授权控制台</h3>
            <p class="text-xs text-gray-400 mt-0.5">针对资源: {{ currentResourceTitle }}</p>
          </div>
          <button @click="showPurchasesModal = false" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <!-- 1. 手动开通小表单区 -->
        <div class="bg-gray-50 border border-gray-200 p-4 rounded-xl mt-4 space-y-3 flex-shrink-0">
          <h4 class="text-xs font-bold text-[#1e3a5f] uppercase tracking-wide">💡 手动增设用户专属预览或下载授权</h4>
          <form @submit.prevent="handleAddPurchase" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-1">用户邮箱 *</label>
              <input v-model="purchaseForm.user_email" type="email" required placeholder="example@urbancopilot.cn" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-1">授权权限类型</label>
              <select v-model="purchaseForm.access_type" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none">
                <option value="view">查看权限 (view)</option>
                <option value="download">下载权限 (download)</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 mb-1">记账实付金额 (元)</label>
              <input v-model.number="purchaseForm.amount_yuan" type="number" step="0.01" min="0" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none">
            </div>
            <div>
              <button type="submit" class="w-full py-1.5 px-4 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow">确认手工发卡</button>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-1">
            <label class="block text-[10px] font-bold text-gray-500">备注说明信息</label>
            <input v-model="purchaseForm.note" type="text" placeholder="例: 微信线下付款5元 2026-06-22 特此永久授权" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none">
          </div>
        </div>

        <!-- 2. 已开通列表区 -->
        <div class="mt-4 overflow-y-auto flex-grow">
          <div v-if="purchasesLoading" class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
          <div v-else-if="purchases.length === 0" class="text-center py-10 text-gray-400 text-xs">
            暂无关于该资源的用户特许购买记录及授权记录
          </div>
          <table v-else class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-gray-100/70 border-b border-gray-200">
                <th class="px-4 py-2 font-bold text-gray-600">注册邮箱</th>
                <th class="px-4 py-2 font-bold text-gray-600">授权权限</th>
                <th class="px-4 py-2 font-bold text-gray-600">记账金额</th>
                <th class="px-4 py-2 font-bold text-gray-600">备注摘要</th>
                <th class="px-4 py-2 font-bold text-gray-600">开通时间</th>
                <th class="px-4 py-2 font-bold text-gray-600 text-right">撤销操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in purchases" :key="item.id" class="hover:bg-gray-50/50">
                <td class="px-4 py-2 font-medium text-gray-900">{{ item.email }}</td>
                <td class="px-4 py-2">
                  <span :class="item.access_type === 'view' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-purple-700 bg-purple-50 border-purple-200'" class="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold">
                    {{ item.access_type === 'view' ? '查看' : '下载' }}
                  </span>
                </td>
                <td class="px-4 py-2 font-medium">{{ formatPrice(item.amount) }}</td>
                <td class="px-4 py-2 text-gray-500 max-w-xs truncate" :title="item.note">{{ item.note || '-' }}</td>
                <td class="px-4 py-2 text-gray-400">{{ formatDate(item.created_at) }}</td>
                <td class="px-4 py-2 text-right">
                  <button @click="handleDeletePurchase(item.id)" class="text-red-600 hover:text-red-800 font-bold hover:underline">撤销授权</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 固定的模块和基准 API
const MODULE = 'knowledge'
const API_BASE = 'https://api.urbancopilot.qzz.io'

// 列表及加载控制
const resources = ref([])
const loading = ref(false)

// 资源编辑 Modal 状态与绑定
const showFormModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const selectedFile = ref(null)
const form = ref({
  title: '',
  description: '',
  category: '',
  min_level: 0,
  view_price_yuan: 0,
  download_price_yuan: 0,
  source_type: 'upload',
  external_url: '',
  document_date: ''
})

// 分类下拉组合框状态变量
const categorySelect = ref('')
const categoryCustom = ref('')

// 动态提取已有分类并去重
const existingCategories = computed(() => {
  const cats = resources.value.map(item => item.category).filter(Boolean)
  return [...new Set(cats)]
})

// 订单/特许授权 Modal 状态
const showPurchasesModal = ref(false)
const purchasesLoading = ref(false)
const purchases = ref([])
const currentResourceId = ref(null)
const currentResourceTitle = ref('')
const purchaseForm = ref({
  user_email: '',
  access_type: 'view',
  amount_yuan: 0,
  note: ''
})

// 读取授权 Token 头
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`
  }
}

// 1. 获取资源列表
const fetchResources = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${API_BASE}/api/admin/resources?module=${MODULE}`, {
      headers: getHeaders()
    })
    const dataList = res.data.resources || []
    
    // 按发布日期或创建时间做降序排序 (最新排在最前)
    dataList.sort((a, b) => {
      const valA = a.document_date || a.created_at || ''
      const valB = b.document_date || b.created_at || ''
      if (valA < valB) return 1
      if (valA > valB) return -1
      return 0
    })
    
    resources.value = dataList
  } catch (err) {
    alert('无法加载知识列表，错误提示: ' + (err.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}

// 2. 预览资源文件（管理员放行直通）
const handlePreview = async (item) => {
  if (item.source_type === 'external') {
    window.open(item.external_url, '_blank')
    return
  }
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/api/resources/${item.id}/access?type=view`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('获取预览失败或当前文件不存在')
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (err) {
    alert('预览失败: ' + err.message)
  }
}

// 3. 删除资源（级联剔除 R2 物理文件与 D1 索引）
const handleDelete = async (id) => {
  if (!confirm('🚨 安全警示：您是否确定要彻底删除此项资源？\n这将同步销毁 R2 文件物理存储，且该操作不可逆！')) return
  try {
    const res = await axios.delete(`${API_BASE}/api/admin/resources/${id}`, {
      headers: getHeaders()
    })
    if (res.data.success) {
      alert('资源已物理彻底清除')
      fetchResources()
    }
  } catch (err) {
    alert('删除失败: ' + (err.response?.data?.message || err.message))
  }
}

// 4. 一键上架/下架切换
const toggleStatus = async (item) => {
  const newStatus = item.status === 'active' ? 'inactive' : 'active'
  try {
    const formData = new FormData()
    formData.append('module', MODULE)
    formData.append('title', item.title)
    formData.append('description', item.description || '')
    formData.append('category', item.category || '')
    formData.append('min_level', String(item.min_level))
    formData.append('view_price', String(item.view_price))
    formData.append('download_price', String(item.download_price))
    formData.append('status', newStatus)
    formData.append('source_type', item.source_type || 'upload')
    formData.append('document_date', item.document_date || '')
    if (item.source_type === 'external') {
      formData.append('external_url', item.external_url || '')
    }

    const res = await axios.put(`${API_BASE}/api/admin/resources/${item.id}`, formData, {
      headers: getHeaders()
    })
    if (res.data.success) {
      alert('状态切换成功')
      fetchResources()
    }
  } catch (err) {
    alert('状态切换失败: ' + (err.response?.data?.message || err.message))
  }
}

// 5. 资源表单模态框开启动作
const openAddModal = () => {
  isEdit.value = false
  selectedFile.value = null
  categorySelect.value = ''
  categoryCustom.value = ''
  form.value = {
    title: '',
    description: '',
    category: '',
    min_level: 0,
    view_price_yuan: 0,
    download_price_yuan: 0,
    source_type: 'upload',
    external_url: '',
    document_date: ''
  }
  showFormModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  currentId.value = item.id
  selectedFile.value = null

  // 处理分类下拉选项或手动输入的自动匹配
  const cat = item.category || ''
  if (cat === '') {
    categorySelect.value = ''
    categoryCustom.value = ''
  } else if (existingCategories.value.includes(cat)) {
    categorySelect.value = cat
    categoryCustom.value = ''
  } else {
    categorySelect.value = '__custom__'
    categoryCustom.value = cat
  }

  form.value = {
    title: item.title,
    description: item.description || '',
    category: item.category || '',
    min_level: item.min_level,
    view_price_yuan: Number((item.view_price / 100).toFixed(2)),
    download_price_yuan: Number((item.download_price / 100).toFixed(2)),
    source_type: item.source_type || 'upload',
    external_url: item.external_url || '',
    document_date: item.document_date || ''
  }
  showFormModal.value = true
}

// 6. 文件选择与 30MB 拦截器校验
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 30 * 1024 * 1024) {
      alert('⚠️ 文件安全拦截：单个上传文件尺寸上限不可超出 30MB！')
      e.target.value = ''
      selectedFile.value = null
      return
    }
    selectedFile.value = file
  }
}

// 7. 提交主表单
const submitForm = async () => {
  try {
    const formData = new FormData()
    formData.append('module', MODULE)
    formData.append('title', form.value.title)
    formData.append('description', form.value.description || '')

    // 分类组合框提交逻辑判定
    const finalCategory = categorySelect.value === '__custom__' ? categoryCustom.value : categorySelect.value
    formData.append('category', finalCategory || '')

    formData.append('min_level', String(form.value.min_level))
    formData.append('source_type', form.value.source_type)
    formData.append('document_date', form.value.document_date || '')

    if (form.value.source_type === 'external') {
      formData.append('external_url', form.value.external_url)
      formData.append('view_price', String(Math.round(form.value.view_price_yuan * 100)))
      formData.append('download_price', '0')
    } else {
      formData.append('view_price', String(Math.round(form.value.view_price_yuan * 100)))
      formData.append('download_price', String(Math.round(form.value.download_price_yuan * 100)))
      if (selectedFile.value) {
        formData.append('file', selectedFile.value)
      }
    }

    let res
    if (isEdit.value) {
      res = await axios.put(`${API_BASE}/api/admin/resources/${currentId.value}`, formData, {
        headers: getHeaders()
      })
    } else {
      res = await axios.post(`${API_BASE}/api/admin/resources`, formData, {
        headers: getHeaders()
      })
    }

    if (res.data.success) {
      alert('知识资源保存成功')
      showFormModal.value = false
      fetchResources()
    }
  } catch (err) {
    alert('保存失败: ' + (err.response?.data?.message || err.message))
  }
}

// 8. 购买与特许授权记录管理
const openPurchasesModal = (item) => {
  currentResourceId.value = item.id
  currentResourceTitle.value = item.title
  purchaseForm.value = {
    user_email: '',
    access_type: 'view',
    amount_yuan: 0,
    note: ''
  }
  showPurchasesModal.value = true
  fetchPurchases()
}

const fetchPurchases = async () => {
  purchasesLoading.value = true
  try {
    const res = await axios.get(`${API_BASE}/api/admin/purchases?resource_id=${currentResourceId.value}`, {
      headers: getHeaders()
    })
    purchases.value = res.data.purchases || []
  } catch (err) {
    alert('拉取授权购买日志失败')
  } finally {
    purchasesLoading.value = false
  }
}

const handleAddPurchase = async () => {
  try {
    const res = await axios.post(`${API_BASE}/api/admin/purchases`, {
      user_email: purchaseForm.value.user_email,
      resource_id: currentResourceId.value,
      access_type: purchaseForm.value.access_type,
      amount: Math.round(purchaseForm.value.amount_yuan * 100),
      note: purchaseForm.value.note
    }, {
      headers: getHeaders()
    })
    if (res.data.success) {
      alert('手动特许发卡授权成功')
      purchaseForm.value = {
        user_email: '',
        access_type: 'view',
        amount_yuan: 0,
        note: ''
      }
      fetchPurchases()
    }
  } catch (err) {
    alert('手动发卡失败: ' + (err.response?.data?.message || err.message))
  }
}

const handleDeletePurchase = async (purchaseId) => {
  if (!confirm('您是否确定要废止撤销该用户的授权许可？撤销后该用户将立即失去此专属权益。')) return
  try {
    const res = await axios.delete(`${API_BASE}/api/admin/purchases/${purchaseId}`, {
      headers: getHeaders()
    })
    if (res.data.success) {
      alert('专属授权已被成功撤销')
      fetchPurchases()
    }
  } catch (err) {
    alert('撤销失败: ' + (err.response?.data?.message || err.message))
  }
}

// 9. 基础辅助换算处理
const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  } else {
    return `${(kb / 1024).toFixed(1)} MB`
  }
}

const formatPrice = (cent) => {
  if (!cent || cent === 0) return '免费'
  return `¥${(cent / 100).toFixed(2)}`
}

const getLevelText = (level) => {
  switch (level) {
    case 0: return '公开'
    case 1: return '免费用户'
    case 2: return '仅会员'
    default: return '未知'
  }
}

const getLevelClass = (level) => {
  switch (level) {
    case 0: return 'bg-green-50 text-green-700 border-green-200'
    case 1: return 'bg-blue-50 text-blue-700 border-blue-200'
    case 2: return 'bg-orange-50 text-orange-700 border-orange-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch (e) {
    return dateStr
  }
}

onMounted(() => {
  fetchResources()
})
</script>