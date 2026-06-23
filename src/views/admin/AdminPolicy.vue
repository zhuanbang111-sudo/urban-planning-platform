<!-- 保存路径: src/views/admin/AdminPolicy.vue -->
<template>
  <div class="space-y-6">
    <!-- 顶部状态栏 -->
    <div class="bg-white rounded-xl border border-gray-150 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📜</span> 政策库管理
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          管理国土空间、综合管廊、海绵城市等规划政策文献文件，支持文件分流直传 R2 与 AI 条文解析权限设置。
        </p>
      </div>
      <button 
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-900 text-white hover:bg-blue-850 font-bold rounded-lg text-sm flex items-center gap-2 transition"
      >
        <span>➕</span> 上传新政策文献
      </button>
    </div>

    <!-- 异常状态横幅 -->
    <div v-if="errorMsg" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex justify-between items-center animate-fade-in">
      <p class="text-sm text-red-700 font-medium">{{ errorMsg }}</p>
      <button @click="errorMsg = ''" class="text-red-500 hover:text-red-800 text-xs">✕</button>
    </div>

    <!-- 成功状态横幅 -->
    <div v-if="successMsg" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex justify-between items-center animate-fade-in">
      <p class="text-sm text-green-700 font-medium">✨ {{ successMsg }}</p>
      <button @click="successMsg = ''" class="text-green-500 hover:text-green-800 text-xs">✕</button>
    </div>

    <!-- 搜索筛选与列表 -->
    <div class="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="relative w-full sm:w-80">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索政策标题或分类..." 
            class="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          />
          <span class="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100 font-bold">
              <th class="py-3 px-6">文献标题 / 实体文件</th>
              <th class="py-3 px-6">二级分类</th>
              <th class="py-3 px-6">大小</th>
              <th class="py-3 px-6">阅读条件</th>
              <th class="py-3 px-6">在线查看价</th>
              <th class="py-3 px-6">下载解锁价</th>
              <th class="py-3 px-6">状态</th>
              <th class="py-3 px-6 text-center">操作区</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-if="loading" class="text-center">
              <td colspan="8" class="py-12 text-gray-400 font-medium">正在读取政策云端物理存储索引...</td>
            </tr>
            <tr v-else-if="filteredResources.length === 0" class="text-center">
              <td colspan="8" class="py-12 text-gray-400 font-medium">暂无匹配的政策文献，请点击右上角开始录入。</td>
            </tr>
            <tr v-else v-for="res in filteredResources" :key="res.id" class="hover:bg-gray-50/50 transition-all">
              <td class="py-4 px-6 max-w-xs">
                <div class="font-bold text-gray-900 flex items-center gap-1.5">
                  <span>📜</span>
                  <span class="truncate block" :title="res.title">{{ res.title }}</span>
                </div>
                <div class="text-xs text-gray-400 font-mono mt-1 truncate" :title="res.file_name">{{ res.file_name }}</div>
              </td>
              <td class="py-4 px-6">
                <span class="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">{{ res.category || '未指定' }}</span>
              </td>
              <td class="py-4 px-6 font-mono text-xs text-gray-500">{{ formatSize(res.file_size) }}</td>
              <td class="py-4 px-6">
                <span :class="getLevelBadge(res.min_level)" class="px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {{ getLevelText(res.min_level) }}
                </span>
              </td>
              <td class="py-4 px-6 font-medium text-gray-700">{{ formatPrice(res.view_price) }}</td>
              <td class="py-4 px-6 font-medium text-gray-700">{{ formatPrice(res.download_price) }}</td>
              <td class="py-4 px-6">
                <span :class="res.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'" class="px-2 py-0.5 rounded text-xs font-semibold">
                  {{ res.status === 'active' ? '已上架' : '已下架' }}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex justify-center items-center gap-3">
                  <button @click="handlePreview(res.id)" class="text-blue-900 hover:text-blue-700 font-bold text-xs">预览</button>
                  <button @click="openEditModal(res)" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs">编辑</button>
                  <button @click="toggleStatus(res)" class="text-orange-600 hover:text-orange-800 font-bold text-xs">
                    {{ res.status === 'active' ? '下架' : '上架' }}
                  </button>
                  <button @click="openPurchasesModal(res)" class="text-purple-600 hover:text-purple-800 font-bold text-xs">特许授权</button>
                  <button @click="handleDelete(res)" class="text-red-500 hover:text-red-700 font-bold text-xs">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 1. 新建/编辑资源大弹窗 (Modal) -->
    <div v-if="showFormModal" class="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
        <div class="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <h3 class="font-bold text-lg">{{ isEditMode ? '🛠 编辑政策卡片属性' : '📤 上传全新政策文献' }}</h3>
          <button @click="closeFormModal" class="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">文件标题 *</label>
            <input v-model="form.title" type="text" required placeholder="如：XX市海绵城市建设技术导则" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">政策简析/描述</label>
            <textarea v-model="form.description" rows="3" placeholder="政策简述与核心条文摘要说明..." class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">二级分类</label>
              <input v-model="form.category" type="text" placeholder="如：海绵城市" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">查看级别限制 *</label>
              <select v-model.number="form.min_level" class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900">
                <option :value="0">公开（访客及所有人可读）</option>
                <option :value="1">免费用户（需登录账号）</option>
                <option :value="2">仅限会员（需付费或特许授权）</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-150">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">在线查看定价 *</label>
              <div class="relative">
                <span class="absolute left-2.5 top-1.5 text-gray-400 text-sm">¥</span>
                <input v-model.number="form.view_price_yuan" type="number" step="0.01" min="0" required class="w-full pl-6 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <span class="text-[10px] text-gray-400 mt-1 block">0表示免费查看</span>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">物理下载定价 *</label>
              <div class="relative">
                <span class="absolute left-2.5 top-1.5 text-gray-400 text-sm">¥</span>
                <input v-model.number="form.download_price_yuan" type="number" step="0.01" min="0" required class="w-full pl-6 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900" />
              </div>
              <span class="text-[10px] text-gray-400 mt-1 block">0表示免费下载</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">实体政策文件 (PDF) *</label>
            <div class="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition">
              <input type="file" ref="fileInput" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" @change="onFileChange" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <div class="space-y-1">
                <span class="text-xl">📁</span>
                <p class="text-xs font-bold text-blue-900">{{ uploadFile ? '已载入:' : '拖入或点击上传物理文件' }}</p>
                <p class="text-[10px] text-gray-400">{{ uploadFile ? `${uploadFile.name} (${formatSize(uploadFile.size)})` : '单文件大小在30MB以内' }}</p>
              </div>
            </div>
            <p v-if="isEditMode" class="text-[10px] text-gray-400 text-center mt-1">留空则保持原政策文件不变</p>
          </div>

          <div class="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="button" @click="closeFormModal" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">取消</button>
            <button type="submit" :disabled="submitting" class="px-5 py-2 bg-blue-900 hover:bg-blue-850 text-white rounded-lg text-sm font-bold min-w-[90px] flex items-center justify-center transition">
              {{ submitting ? '上传中...' : '提交部署' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. 手动特许授权管理弹窗 (Purchases Modal) -->
    <div v-if="showPurchasesModal" class="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div class="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-lg">特许授权管理</h3>
            <p class="text-xs text-purple-200 mt-0.5">针对《{{ activeResource?.title }}》手动开辟权限</p>
          </div>
          <button @click="closePurchasesModal" class="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        <div class="p-6 space-y-6">
          <!-- 手动授权表单 -->
          <form @submit.prevent="submitGrant" class="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-3">
            <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1">⚡ 新增手动特许开通通道</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">用户邮箱 *</label>
                <input v-model="grantForm.user_email" type="email" required placeholder="user@qq.com" class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">权限类型 *</label>
                <select v-model="grantForm.access_type" class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900">
                  <option value="view">仅限在线查看</option>
                  <option value="download">完整下载权限</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-600 mb-1">实收金额 (元)</label>
                <input v-model.number="grantForm.amount_yuan" type="number" step="0.01" min="0" class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900" />
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-600 mb-1">备注信息</label>
              <input v-model="grantForm.note" type="text" placeholder="例如: 线下转账，或科研团队赠送" class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-900" />
            </div>
            <div class="flex justify-end">
              <button type="submit" :disabled="submittingGrant" class="px-4 py-1.5 bg-purple-900 hover:bg-purple-850 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition">
                {{ submittingGrant ? '执行中...' : '确认下发授权' }}
              </button>
            </div>
          </form>

          <!-- 授权记录展示区 -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-800">📜 现有开通记录列表</h4>
            <div class="overflow-y-auto max-h-56 border border-gray-150 rounded-xl">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold">
                  <tr>
                    <th class="py-2 px-4">授权人邮箱</th>
                    <th class="py-2 px-4">权限类型</th>
                    <th class="py-2 px-4">实收金额</th>
                    <th class="py-2 px-4">备注/建档</th>
                    <th class="py-2 px-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="purchasesLoading" class="text-center">
                    <td colspan="5" class="py-6 text-gray-400">正在检索权限表单...</td>
                  </tr>
                  <tr v-else-if="purchases.length === 0" class="text-center">
                    <td colspan="5" class="py-6 text-gray-400">暂无任何手动开通记录。</td>
                  </tr>
                  <tr v-else v-for="p in purchases" :key="p.id" class="hover:bg-gray-50/50">
                    <td class="py-2 px-4 font-medium text-gray-900">{{ p.email }}</td>
                    <td class="py-2 px-4">
                      <span :class="p.access_type === 'download' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'" class="px-2 py-0.5 rounded font-bold">
                        {{ p.access_type === 'download' ? '下载' : '查看' }}
                      </span>
                    </td>
                    <td class="py-2 px-4 font-medium text-gray-700">¥{{ (p.amount / 100).toFixed(2) }}</td>
                    <td class="py-2 px-4 text-gray-500 max-w-[150px] truncate" :title="p.note">{{ p.note || '-' }}</td>
                    <td class="py-2 px-4 text-center">
                      <button @click="handleRevokePurchase(p.id)" class="text-red-500 hover:text-red-700 font-bold">撤销</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 基础变量
const BASE_URL = 'https://api.urbancopilot.qzz.io'
const CURRENT_MODULE = 'policy'

const resources = ref([])
const purchases = ref([])
const searchQuery = ref('')
const loading = ref(true)
const purchasesLoading = ref(true)
const submitting = ref(false)
const submittingGrant = ref(false)

const errorMsg = ref('')
const successMsg = ref('')

// Modal控制
const showFormModal = ref(false)
const isEditMode = ref(false)
const showPurchasesModal = ref(false)
const activeResource = ref(null)

// 资源上传对象
const fileInput = ref(null)
const uploadFile = ref(null)

// 资源表单模型
const form = ref({
  id: '',
  title: '',
  description: '',
  category: '',
  min_level: 2,
  view_price_yuan: 0,
  download_price_yuan: 0,
  status: 'active'
})

// 特许开通表单模型
const grantForm = ref({
  user_email: '',
  access_type: 'view',
  amount_yuan: 0,
  note: ''
})

// 配置请求Token
const getAxiosConfig = (isMultipart = false) => {
  const token = localStorage.getItem('token')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  return config
}

// 转换及格式化方法
const toFen = (yuan) => Math.round(Number(yuan || 0) * 100)
const formatPrice = (fen) => (!fen ? '免费' : `¥${(fen / 100).toFixed(2)}`)
const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null) return '0 KB'
  const kb = bytes / 1024
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`
}
const getLevelText = (lvl) => lvl === 0 ? '公开' : lvl === 1 ? '免费用户' : '仅会员'
const getLevelBadge = (lvl) => lvl === 0 ? 'bg-green-50 text-green-700 border border-green-200' : lvl === 1 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'

// 数据筛选
const filteredResources = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return resources.value
  return resources.value.filter(r => r.title.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q))
})

// 获取资源大盘数据
const fetchResources = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/api/admin/resources?module=${CURRENT_MODULE}`, getAxiosConfig())
    resources.value = res.data.resources || []
  } catch (err) {
    errorMsg.value = err.response?.data?.error || '拉取数据大盘异常'
  } finally {
    loading.value = false
  }
}

// 物理流式预览
const handlePreview = async (resourceId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/api/resources/${resourceId}/access?type=view`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('读取权限错误或文件损坏')
    const blob = await response.blob()
    const fileUrl = URL.createObjectURL(blob)
    window.open(fileUrl, '_blank')
  } catch (err) {
    alert('预览失败: ' + err.message)
  }
}

// 模态弹框管理
const openCreateModal = () => {
  isEditMode.value = false
  uploadFile.value = null
  form.value = { id: '', title: '', description: '', category: '', min_level: 2, view_price_yuan: 0, download_price_yuan: 0, status: 'active' }
  showFormModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  uploadFile.value = null
  form.value = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    category: item.category || '',
    min_level: item.min_level,
    view_price_yuan: item.view_price / 100,
    download_price_yuan: item.download_price / 100,
    status: item.status
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  uploadFile.value = null
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) uploadFile.value = file
}

// 提交资源增改
const submitForm = async () => {
  if (submitting.value) return
  errorMsg.value = ''
  successMsg.value = ''

  if (!isEditMode.value && !uploadFile.value) {
    alert('创建模式下必须上传文件！')
    return
  }
  if (uploadFile.value && uploadFile.value.size > 30 * 1024 * 1024) {
    alert('文件大小不能超过30MB')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('module', CURRENT_MODULE)
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('category', form.value.category)
    formData.append('min_level', String(form.value.min_level))
    formData.append('view_price', String(toFen(form.value.view_price_yuan)))
    formData.append('download_price', String(toFen(form.value.download_price_yuan)))
    formData.append('status', form.value.status)
    if (uploadFile.value) {
      formData.append('file', uploadFile.value)
    }

    if (isEditMode.value) {
      await axios.put(`${BASE_URL}/api/admin/resources/${form.value.id}`, formData, getAxiosConfig(true))
      successMsg.value = '政策属性已更新！'
    } else {
      await axios.post(`${BASE_URL}/api/admin/resources`, formData, getAxiosConfig(true))
      successMsg.value = '大文件并入 R2 上架成功！'
    }
    closeFormModal()
    fetchResources()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || '上传并部署资源出错'
  } finally {
    submitting.value = false
  }
}

// 物理单条快速切换状态
const toggleStatus = async (item) => {
  errorMsg.value = ''
  successMsg.value = ''
  const nextStatus = item.status === 'active' ? 'inactive' : 'active'
  try {
    const formData = new FormData()
    formData.append('status', nextStatus)
    await axios.put(`${BASE_URL}/api/admin/resources/${item.id}`, formData, getAxiosConfig(true))
    successMsg.value = `状态已变更为: ${nextStatus === 'active' ? '上架中' : '下架中'}`
    fetchResources()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || '状态切换遭遇故障'
  }
}

// 物理彻底卸载删除
const handleDelete = async (item) => {
  if (!confirm(`将同时删除R2中的文件，此操作不可恢复！\n安全确认：您真的要彻底删除《${item.title}》吗？`)) return
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await axios.delete(`${BASE_URL}/api/admin/resources/${item.id}`, getAxiosConfig())
    successMsg.value = '政策文献已被彻底清除。'
    fetchResources()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || '执行删除错误'
  }
}

// 手动特许开通板块逻辑
const openPurchasesModal = (item) => {
  activeResource.value = item
  grantForm.value = { user_email: '', access_type: 'view', amount_yuan: 0, note: '' }
  showPurchasesModal.value = true
  fetchPurchases()
}

const closePurchasesModal = () => {
  showPurchasesModal.value = false
  activeResource.value = null
}

const fetchPurchases = async () => {
  purchasesLoading.value = true
  try {
    const res = await axios.get(`${BASE_URL}/api/admin/purchases?resource_id=${activeResource.value.id}`, getAxiosConfig())
    purchases.value = res.data.purchases || []
  } catch (err) {
    console.error(err)
  } finally {
    purchasesLoading.value = false
  }
}

const submitGrant = async () => {
  if (submittingGrant.value) return
  submittingGrant.value = true
  try {
    const payload = {
      user_email: grantForm.value.user_email,
      resource_id: activeResource.value.id,
      access_type: grantForm.value.access_type,
      amount: toFen(grantForm.value.amount_yuan),
      note: grantForm.value.note
    }
    await axios.post(`${BASE_URL}/api/admin/purchases`, payload, getAxiosConfig())
    alert('特许授权配置成功下发！')
    grantForm.value = { user_email: '', access_type: 'view', amount_yuan: 0, note: '' }
    fetchPurchases()
  } catch (err) {
    alert('授权开通失败: ' + (err.response?.data?.error || '网络未知连接错误'))
  } finally {
    submittingGrant.value = false
  }
}

const handleRevokePurchase = async (id) => {
  if (!confirm('确定要撤销这一条开通特许权限吗？用户将再次受限于定价与等级策略限制。')) return
  try {
    await axios.delete(`${BASE_URL}/api/admin/purchases/${id}`, getAxiosConfig())
    alert('权限开辟已撤销！')
    fetchPurchases()
  } catch (err) {
    alert('撤销配置失败: ' + (err.response?.data?.error || '通信异常'))
  }
}

onMounted(() => {
  fetchResources()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.18s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>