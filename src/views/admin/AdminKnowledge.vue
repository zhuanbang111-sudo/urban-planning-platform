<!-- 保存路径: src/views/admin/LibraryAdmin.vue -->
<template>
  <div class="space-y-6">
    <!-- 头部卡片 -->
    <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📚</span> 知识库管理
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          管理专业知识文件上传，控制游客、用户和会员的下载权限级别与定价。
        </p>
      </div>
      <!-- 动作按钮区 -->
      <div class="flex gap-2">
        <button 
          @click="activeTab = 'list'"
          :class="[activeTab === 'list' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          class="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150"
        >
          文件资源列表
        </button>
        <button 
          @click="activeTab = 'purchases'"
          :class="[activeTab === 'purchases' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          class="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150"
        >
          手动授权管理
        </button>
      </div>
    </div>

    <!-- 异常状态提示 -->
    <div v-if="errorMsg" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex justify-between items-center">
      <p class="text-sm text-red-700 font-medium">{{ errorMsg }}</p>
      <button @click="errorMsg = ''" class="text-red-500 hover:text-red-800 text-xs">✕</button>
    </div>

    <!-- 成功状态提示 -->
    <div v-if="successMsg" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex justify-between items-center animate-fade-in">
      <p class="text-sm text-green-700 font-medium">✨ {{ successMsg }}</p>
      <button @click="successMsg = ''" class="text-green-500 hover:text-green-800 text-xs">✕</button>
    </div>

    <!-- 子板块 1：文件资源列表 (CRUD) -->
    <div v-if="activeTab === 'list'" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- 搜索及新增 -->
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="relative w-full sm:w-72">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索资料名称/分类..." 
            class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
          />
          <span class="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
        <button 
          @click="openCreateModal"
          class="w-full sm:w-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>➕</span> 上传新资源文件
        </button>
      </div>

      <!-- 数据表 -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-100">
              <th class="py-3.5 px-6 font-semibold">资料名称 / 格式</th>
              <th class="py-3.5 px-6 font-semibold">分类</th>
              <th class="py-3.5 px-6 font-semibold">大小</th>
              <th class="py-3.5 px-6 font-semibold">最低权限</th>
              <th class="py-3.5 px-6 font-semibold">定价 (查看/下载)</th>
              <th class="py-3.5 px-6 font-semibold">状态</th>
              <th class="py-3.5 px-6 font-semibold text-center">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="py-10 text-gray-400">正在与边缘端 R2 存储桶同步中...</td>
            </tr>
            <tr v-else-if="filteredResources.length === 0" class="text-center">
              <td colspan="7" class="py-10 text-gray-400">库中暂无规范资料文件，点击右上方开始上传首份文档。</td>
            </tr>
            <tr v-else v-for="res in filteredResources" :key="res.id" class="hover:bg-gray-50/50 transition-colors">
              <!-- 名称 -->
              <td class="py-4 px-6 font-medium text-gray-900 max-w-xs truncate">
                <div>{{ res.title }}</div>
                <div class="text-xs text-gray-400 font-mono mt-0.5">{{ res.file_name || '未上传文件' }}</div>
              </td>
              <!-- 分类 -->
              <td class="py-4 px-6 text-gray-600">
                <span class="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">{{ res.category || '未分类' }}</span>
              </td>
              <!-- 大小 -->
              <td class="py-4 px-6 text-gray-500 font-mono text-xs">
                {{ formatSize(res.file_size) }}
              </td>
              <!-- 最低权限 -->
              <td class="py-4 px-6">
                <span :class="getLevelBadge(res.min_level)" class="px-2.5 py-1 rounded-full text-xs font-bold">
                  {{ getLevelText(res.min_level) }}
                </span>
              </td>
              <!-- 定价 -->
              <td class="py-4 px-6 text-gray-700 font-medium">
                <div>👁 ￥{{ res.view_price || 0 }}</div>
                <div class="text-xs text-gray-400 mt-0.5">📥 ￥{{ res.download_price || 0 }}</div>
              </td>
              <!-- 状态 -->
              <td class="py-4 px-6">
                <span :class="res.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'" class="px-2 py-0.5 rounded text-xs font-medium">
                  {{ res.status === 'active' ? '上架中' : '已下架' }}
                </span>
              </td>
              <!-- 操作 -->
              <td class="py-4 px-6 text-center">
                <div class="flex justify-center gap-3">
                  <button @click="openEditModal(res)" class="text-blue-900 hover:text-blue-700 font-semibold text-xs">编辑</button>
                  <button @click="handleDelete(res)" class="text-red-600 hover:text-red-800 font-semibold text-xs">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 子板块 2：手动授权管理 (购买记录管理) -->
    <div v-if="activeTab === 'purchases'" class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div class="border-b border-gray-100 pb-4">
        <h2 class="text-lg font-bold text-gray-900">🎁 手动开通/分配下载查看权限</h2>
        <p class="text-sm text-gray-500 mt-1">您可以直接为特定用户开通某款资料的「永久查看」或「永久下载」权，解决线下支付对账或科研专属赠送场景需求。</p>
      </div>

      <!-- 手动开通表单 -->
      <form @submit.prevent="handleGrantPurchase" class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl items-end">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">用户登录邮箱 (Email)</label>
          <input 
            v-model="grantForm.user_email" 
            type="email" 
            required 
            placeholder="例如: test@qq.com" 
            class="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">选择授权资料</label>
          <select 
            v-model="grantForm.resource_id" 
            required
            class="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
          >
            <option value="" disabled>-- 选择资源 --</option>
            <option v-for="res in resources" :key="res.id" :value="res.id">{{ res.title }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">授权开通权限类型</label>
          <select 
            v-model="grantForm.access_type" 
            required
            class="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
          >
            <option value="view">仅限在线查看 (View)</option>
            <option value="download">允许本地下载 (Download)</option>
          </select>
        </div>
        <button 
          type="submit" 
          :disabled="submitting"
          class="w-full px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-sm transition-all h-[38px] flex items-center justify-center gap-1"
        >
          {{ submitting ? '授权中...' : '确认手动开通' }}
        </button>
      </form>

      <!-- 授权记录列表 -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold text-gray-700">📜 当前历史手动开通/购买授权记录</h3>
        <div class="overflow-x-auto border border-gray-100 rounded-xl">
          <table class="w-full text-left border-collapse text-sm">
            <thead class="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4 font-semibold">被授权用户</th>
                <th class="py-3 px-4 font-semibold">授权资料名称</th>
                <th class="py-3 px-4 font-semibold">权限级别</th>
                <th class="py-3 px-4 font-semibold">开通时间</th>
                <th class="py-3 px-4 font-semibold text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-150">
              <tr v-if="purchasesLoading" class="text-center">
                <td colspan="5" class="py-8 text-gray-400">正在拉取授权账单...</td>
              </tr>
              <tr v-else-if="purchases.length === 0" class="text-center">
                <td colspan="5" class="py-8 text-gray-400">暂无手动开通的特许记录。</td>
              </tr>
              <tr v-else v-for="p in purchases" :key="p.id" class="hover:bg-gray-50/50">
                <td class="py-3.5 px-4 font-medium text-gray-900">{{ p.email }}</td>
                <td class="py-3.5 px-4 text-gray-600 max-w-xs truncate">{{ p.resource_title }}</td>
                <td class="py-3.5 px-4">
                  <span :class="p.access_type === 'download' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'" class="px-2 py-0.5 rounded text-xs font-bold">
                    {{ p.access_type === 'download' ? '📥 物理下载' : '👁 仅线查看' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-gray-400 font-mono text-xs">{{ formatDate(p.created_at) }}</td>
                <td class="py-3.5 px-4 text-center">
                  <button @click="handleRevokePurchase(p.id)" class="text-red-500 hover:text-red-700 font-semibold text-xs">撤销授权</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 弹窗：新建 / 编辑资源 (纯响应式 Modal) -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-fade-in">
        <!-- 弹窗头部 -->
        <div class="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <h3 class="font-bold text-lg">
            {{ isEditMode ? '🛠 编辑规范资料卡片' : '📤 上传规范资料及文件' }}
          </h3>
          <button @click="closeModal" class="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        <!-- 弹窗主体 -->
        <form @submit.prevent="handleSaveResource" class="p-6 space-y-4">
          <!-- 标题 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">文件显示标题 (Title) *</label>
            <input 
              v-model="resourceForm.title" 
              type="text" 
              required 
              placeholder="请输入要在前台展示的文献标题" 
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
            />
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">内容简要描述 (Description)</label>
            <textarea 
              v-model="resourceForm.description" 
              rows="2"
              placeholder="简述该标准规划或政策的适用范围..." 
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
            ></textarea>
          </div>

          <!-- 分类和权限并排 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">细分类别</label>
              <input 
                v-model="resourceForm.category" 
                type="text" 
                placeholder="如：给水工程 / 城市防洪" 
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">最低访问权限 *</label>
              <select 
                v-model="resourceForm.min_level" 
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
              >
                <option :value="0">访客自由访问 (0)</option>
                <option :value="1">注册用户免费 (1)</option>
                <option :value="2">仅限VIP会员 (2)</option>
              </select>
            </div>
          </div>

          <!-- 价格设置 -->
          <div class="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">在线查看价格 (CNY)</label>
              <input 
                v-model.number="resourceForm.view_price" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">本地下载价格 (CNY)</label>
              <input 
                v-model.number="resourceForm.download_price" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          <!-- 状态设置 (仅编辑模式显示) -->
          <div v-if="isEditMode">
            <label class="block text-xs font-bold text-gray-700 mb-1">上下架状态</label>
            <select 
              v-model="resourceForm.status" 
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-900"
            >
              <option value="active">正常上架提供浏览</option>
              <option value="inactive">临时下架不展示</option>
            </select>
          </div>

          <!-- R2 本地文件直传交互区 -->
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50/50 transition-colors relative">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div class="space-y-1">
              <p class="text-xl">📁</p>
              <p class="text-sm font-bold text-blue-900">
                {{ selectedFile ? '已选择替换文件:' : '点击选择或拖拽标准 PDF/Word 文件' }}
              </p>
              <p class="text-xs text-gray-400">
                {{ selectedFile ? `${selectedFile.name} (${formatSize(selectedFile.size)})` : '支持任何非空文件，单文件上限 30MB' }}
              </p>
            </div>
          </div>
          <!-- 替换提示 (仅编辑模式显示) -->
          <p v-if="isEditMode && !selectedFile" class="text-xxs text-gray-400 leading-normal text-center">
            * 提示：如果您只想修改资料的标题、价格或权限级别，此处请留空，系统会自动沿用原有旧文件。
          </p>

          <!-- 按钮执行区 -->
          <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
            >
              取消
            </button>
            <button 
              type="submit" 
              :disabled="submitting"
              class="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center min-w-[100px]"
            >
              {{ submitting ? '上传处理中...' : '开始部署' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// ==========================================
// 1. 初始化常量与路由响应状态
// ==========================================
const BASE_URL = 'https://api.urbancopilot.qzz.io' // 绑定您的大陆直连免签极速域名
const activeTab = ref('list')
const loading = ref(true)
const purchasesLoading = ref(true)
const submitting = ref(false)

const resources = ref([])
const purchases = ref([])
const searchQuery = ref('')

const errorMsg = ref('')
const successMsg = ref('')

// Modal 控制器
const showModal = ref(false)
const isEditMode = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)

// 资源模型初始值
const resourceForm = ref({
  id: '',
  title: '',
  description: '',
  category: '',
  min_level: 2,
  view_price: 0,
  download_price: 0,
  status: 'active'
})

// 手动开通授权模型初始值
const grantForm = ref({
  user_email: '',
  resource_id: '',
  access_type: 'view'
})

// ==========================================
// 2. 自定义过滤与格式化辅助函数
// ==========================================
const filteredResources = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return resources.value
  return resources.value.filter(item => 
    item.title?.toLowerCase().includes(query) || 
    item.category?.toLowerCase().includes(query)
  )
})

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.replace('T', ' ').substring(0, 19)
}

const getLevelText = (lvl) => {
  if (lvl === 0) return '游客免登录'
  if (lvl === 1) return '注册用户免费'
  return '仅限VIP会员'
}

const getLevelBadge = (lvl) => {
  if (lvl === 0) return 'bg-gray-100 text-gray-700'
  if (lvl === 1) return 'bg-green-50 text-green-700 border border-green-200'
  return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
}

// ==========================================
// 3. API 请求安全封装 (附带 JWT Bearer Token)
// ==========================================
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token}`
  }
}

// 统一提取列表 (固定只查询本模块 'library' 下的所有 R2 文件资源)
const fetchResources = async () => {
  loading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/admin/resources?module=library`, {
      headers: getHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      resources.value = data.resources || []
    } else {
      errorMsg.value = data.error || '获取资料库资源失败'
    }
  } catch (err) {
    errorMsg.value = '连接服务器失败，请检查网络是否畅通。'
  } finally {
    loading.value = false
  }
}

// 统一提取购买和手动特许账单
const fetchPurchases = async () => {
  purchasesLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/admin/purchases`, {
      headers: getHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      purchases.value = data.purchases || []
    } else {
      errorMsg.value = data.error || '拉取授权失败'
    }
  } catch (err) {
    errorMsg.value = '连接授权服务器发生异常。'
  } finally {
    purchasesLoading.value = false
  }
}

// ==========================================
// 4. Modal 动作状态开闭
// ==========================================
const openCreateModal = () => {
  isEditMode.value = false
  selectedFile.value = null
  resourceForm.value = {
    id: '',
    title: '',
    description: '',
    category: '',
    min_level: 2,
    view_price: 0,
    download_price: 0,
    status: 'active'
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  selectedFile.value = null
  resourceForm.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedFile.value = null
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

// ==========================================
// 5. 新建和编辑（核心 Multipart/form-data 异步提交流）
// ==========================================
const handleSaveResource = async () => {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const formData = new FormData()
    formData.append('module', 'knowledge') // 固定锁定属于：标准规范资料库 模块
    formData.append('title', resourceForm.value.title)
    formData.append('description', resourceForm.value.description)
    formData.append('category', resourceForm.value.category)
    formData.append('min_level', resourceForm.value.min_level)
    formData.append('view_price', resourceForm.value.view_price)
    formData.append('download_price', resourceForm.value.download_price)
    formData.append('status', resourceForm.value.status)

    // 新增模式：物理强制上传非空文件
    if (!isEditMode.value) {
      if (!selectedFile.value) {
        errorMsg.value = '新建资源必须上传对应的规范实体文件！'
        submitting.value = false
        return
      }
      formData.append('file', selectedFile.value)
    } else {
      // 修改模式：只在用户选了新文件时才追加进行覆盖上传
      if (selectedFile.value) {
        formData.append('file', selectedFile.value)
      }
    }

    const url = isEditMode.value 
      ? `${BASE_URL}/api/admin/resources/${resourceForm.value.id}` 
      : `${BASE_URL}/api/admin/resources`
    
    const method = isEditMode.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: getHeaders(), // 注意：由 fetch 自动构建带 boundary 的 multipart/form-data，不可手动写 content-type
      body: formData
    })

    const data = await res.json()
    if (res.ok) {
      successMsg.value = isEditMode.value ? '资料属性及配套文件覆盖更新成功！' : '大文件极速部署至 R2 成功，规范资源卡片已上架！'
      closeModal()
      fetchResources() // 刷新视图
    } else {
      errorMsg.value = data.error || '上传或保存失败'
    }

  } catch (err) {
    errorMsg.value = '文件或信息保存过程中发生网络未知故障。'
  } finally {
    submitting.value = false
  }
}

// ==========================================
// 6. 文件规范删除物理回收
// ==========================================
const handleDelete = async (item) => {
  if (!confirm(`安全确认：您确定要物理删除规范文件【${item.title}】吗？删除后存储桶 R2 内对应的物理文件将同步回收！此操作不可逆！`)) return
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await fetch(`${BASE_URL}/api/admin/resources/${item.id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      successMsg.value = '资料卡片及云端物理文件已一并完成彻底回收删除。'
      fetchResources()
    } else {
      errorMsg.value = data.error || '删除失败'
    }
  } catch (err) {
    errorMsg.value = '发起物理回收删除请求异常。'
  }
}

// ==========================================
// 7. 手动分配购买授权逻辑
// ==========================================
const handleGrantPurchase = async () => {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await fetch(`${BASE_URL}/api/admin/purchases`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grantForm.value)
    })
    const data = await res.json()
    if (res.ok) {
      successMsg.value = `成功为用户 [${grantForm.value.user_email}] 开通专属对应下载权限！`
      grantForm.value.user_email = ''
      grantForm.value.resource_id = ''
      fetchPurchases()
    } else {
      errorMsg.value = data.error || '开通特许失败'
    }
  } catch (err) {
    errorMsg.value = '与授权分配网关建立连接失败。'
  } finally {
    submitting.value = false
  }
}

// 撤销手动开通的特许记录
const handleRevokePurchase = async (id) => {
  if (!confirm('安全确认：确定要彻底撤销这一条手动特许开通的权限记录吗？')) return
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const res = await fetch(`${BASE_URL}/api/admin/purchases/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    const data = await res.json()
    if (res.ok) {
      successMsg.value = '特许订单授权成功注销撤回。'
      fetchPurchases()
    } else {
      errorMsg.value = data.error || '注销失败'
    }
  } catch (err) {
    errorMsg.value = '撤回特权请求通讯失败。'
  }
}

// ==========================================
// 8. 挂载加载初始化数据
// ==========================================
onMounted(() => {
  fetchResources()
  fetchPurchases()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>