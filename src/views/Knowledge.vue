<!-- 保存路径: src/views/Knowledge.vue -->
<template>
  <div class="space-y-6">
    <!-- 面包屑及标题 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-amber-950">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">知识库</span>
      </nav>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>💡</span> 知识库
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            聚合国内外城市基础设施规划建设的学术研究成果、政策文件、标准规范、规划设计案例及笔记。
          </p>
        </div>
        <!-- 分类筛选下拉框 -->
        <div class="w-full md:w-64">
          <label class="block text-xs font-semibold text-gray-500 mb-1">专题维度过滤</label>
          <select 
            v-model="selectedCategory"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="isLoading" class="py-12 flex justify-center items-center">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm text-gray-500">正在检索知识库储备...</span>
      </div>
    </div>

    <!-- 空列表状态 -->
    <div v-else-if="filteredSorted.length === 0" class="py-16 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
      <span class="text-4xl">📂</span>
      <h3 class="text-lg font-bold text-gray-800 mt-4">暂无相关知识档案</h3>
      <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">当前分类下暂未发布任何学术笔记，敬请期待系统更新发布。</p>
    </div>

    <!-- 资源列表时间轴 -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
      <div class="relative">
        <!-- 时间轴纵向轨道线 -->
        <div class="absolute left-[76px] top-1 bottom-1 w-px bg-gray-200"></div>
        
        <!-- 时间轴单项 -->
        <div 
          v-for="item in visibleResources" 
          :key="item.id" 
          class="flex gap-6 relative mb-7 last:mb-0"
        >
          <!-- 节点圆点 -->
          <div class="absolute left-[76px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 z-10"></div>
          
          <!-- 左侧发布时间 -->
          <div class="w-16 flex-shrink-0 text-right">
            <div 
              class="text-xl font-medium leading-tight"
              :class="getDisplayDate(item).isFallback ? 'text-gray-400' : 'text-gray-900'"
            >
              {{ getDisplayDate(item).year }}
            </div>
            <div class="text-xs text-gray-400">{{ getDisplayDate(item).monthDay }}</div>
          </div>
          
          <!-- 右侧内容承载区 -->
          <div class="flex-1 min-w-0">
            <!-- 标题 & 标签 -->
            <div class="flex items-baseline justify-between gap-2.5 mb-1.5">
              <span class="text-sm font-bold text-gray-900 truncate min-w-0" :title="item.title">
                {{ item.title }}
              </span>
              <div class="flex gap-1 flex-shrink-0 items-center">
                <span 
                  v-for="tag in getVisibleTags(item.category)" 
                  :key="tag" 
                  class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap"
                >{{ tag }}</span>
                <span 
                  v-if="getOverflowCount(item.category) > 0"
                  class="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 cursor-default whitespace-nowrap"
                  :title="getOverflowTags(item.category).join('，')"
                >+{{ getOverflowCount(item.category) }}</span>
              </div>
            </div>
            
            <!-- 描述 -->
            <p class="text-xs text-gray-500 leading-relaxed mb-2.5 line-clamp-2">
              {{ item.description || '暂无详细描述说明。' }}
            </p>
            
            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button 
                @click="handleAccess(item, 'view')"
                class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-medium text-xs rounded-lg transition-colors border border-amber-200"
              >
                {{ item.source_type === 'external' ? (item.view_price === 0 ? '前往查看' : `前往查看 ¥${(item.view_price/100).toFixed(2)}`) : (item.view_price === 0 ? '查看（免费）' : `查看 ¥${(item.view_price/100).toFixed(2)}`) }}
              </button>
              <button 
                v-if="item.source_type !== 'external'"
                @click="handleAccess(item, 'download')"
                class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition-colors"
              >
                {{ item.download_price === 0 ? '下载（免费）' : `下载 ¥${(item.download_price/100).toFixed(2)}` }}
              </button>
            </div>

            <!-- 相关解读嵌套区域 -->
            <div 
              v-if="childrenMap[item.id] && childrenMap[item.id].length > 0" 
              class="mt-3 bg-gray-50 rounded-lg p-3"
            >
              <div class="text-xs text-gray-600 mb-2 flex items-center gap-1">
                <span>🔗</span>
                <span>相关解读（{{ childrenMap[item.id].length }}）</span>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="article in childrenMap[item.id]" 
                  :key="article.id"
                  class="flex items-center justify-between gap-2"
                >
                  <span class="text-xs text-gray-700 truncate min-w-0" :title="article.title">
                    {{ article.title }}
                  </span>
                  <button 
                    @click="handleAccess(article, 'view')"
                    class="text-[11px] px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-100 rounded-md flex-shrink-0"
                  >
                    查看
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页加载更多 -->
      <div v-if="hasMore" class="flex justify-center mt-8 pt-4 border-t border-gray-100">
        <button 
          @click="loadMore"
          class="text-sm px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          加载更多
        </button>
      </div>
    </div>

    <!-- 付费引导Modal弹窗 -->
    <div v-if="paymentModal.show" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in border border-gray-100">
        <button 
          @click="paymentModal.show = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
        >
          ✕
        </button>
        
        <div class="text-center">
          <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            💎
          </div>
          <h3 class="text-lg font-bold text-gray-900 px-4">权限支付引导</h3>
          <p class="text-sm text-gray-500 mt-2">
            《{{ paymentModal.resource?.title }}》
          </p>
          <p class="text-xs text-gray-400 mt-1">
            需要获取当前资源的 <span class="font-bold text-amber-600">{{ paymentModal.type === 'view' ? '在线预览' : '物理下载' }}</span> 授权
          </p>

          <!-- 价格展示 -->
          <div class="my-5 bg-amber-50/50 py-3 rounded-xl border border-amber-100">
            <span class="text-xs text-gray-500 block">特许永久授权费用</span>
            <span class="text-3xl font-black text-amber-900">
              ¥{{ (paymentModal.price / 100).toFixed(2) }}
            </span>
          </div>

          <!-- 双收款码 -->
          <div class="grid grid-cols-2 gap-4 my-4">
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <img :src="wechatQr" alt="微信支付" class="w-full aspect-square object-contain rounded mb-1.5" />
              <span class="text-xs font-medium text-gray-600">微信支付</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <img :src="alipayQr" alt="支付宝支付" class="w-full aspect-square object-contain rounded mb-1.5" />
              <span class="text-xs font-medium text-gray-600">支付宝支付</span>
            </div>
          </div>

          <!-- 运营配置说明 -->
          <div class="text-left bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3">
            <h4 class="text-xs font-bold text-gray-700 mb-1">💡 扫码开通说明：</h4>
            <p class="text-xs text-gray-600 leading-relaxed">
              {{ publicSettings.payment_contact || '请扫码支付后联系系统管理员手动开通特许权限。' }}
            </p>
          </div>

          <button 
            @click="paymentModal.show = false"
            class="mt-5 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
          >
            我已了解，关闭窗口
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

import wechatQr from '../assets/payment/wechat-qr.png'
import alipayQr from '../assets/payment/alipay-qr.png'

const API_BASE = 'https://api.urbancopilot.qzz.io'

const router = useRouter()
const userStore = useUserStore()

const resources = ref([])
const isLoading = ref(true)
const selectedCategory = ref('全部分类')
const publicSettings = ref({ site_name: '', payment_contact: '' })

// 弹窗状态管理
const paymentModal = ref({
  show: false,
  resource: null,
  type: 'view',
  price: 0
})

// 分页与加载状态
const visibleCount = ref(10)
const PAGE_SIZE = 10

// ---------------- 辅助处理函数 ----------------
const splitTags = (categoryStr) => {
  return (categoryStr || '').split(',').map(t => t.trim()).filter(Boolean)
}

const splitDateParts = (dateStr) => {
  if (!dateStr) return { year: '', monthDay: '' }
  const datePart = dateStr.split('T')[0]
  const parts = datePart.split('-')
  if (parts.length < 3) return { year: datePart, monthDay: '' }
  return { year: parts[0], monthDay: `${parts[1]}-${parts[2]}` }
}

const getDisplayDate = (item) => {
  if (item.document_date) {
    const { year, monthDay } = splitDateParts(item.document_date)
    return { year, monthDay, isFallback: false }
  }
  const { year, monthDay } = splitDateParts(item.created_at)
  return { year, monthDay: `上传 ${monthDay}`, isFallback: true }
}

const getVisibleTags = (categoryStr) => splitTags(categoryStr).slice(0, 3)
const getOverflowTags = (categoryStr) => {
  const tags = splitTags(categoryStr)
  return tags.length > 3 ? tags.slice(3) : []
}
const getOverflowCount = (categoryStr) => Math.max(0, splitTags(categoryStr).length - 3)

// ---------------- 分组/排序 计算属性 ----------------
const allTopLevel = computed(() => 
  resources.value.filter(r => !r.parent_id)
)

const childrenMap = computed(() => {
  const map = {}
  resources.value.forEach(r => {
    if (r.parent_id) {
      if (!map[r.parent_id]) map[r.parent_id] = []
      map[r.parent_id].push(r)
    }
  })
  return map
})

const categories = computed(() => {
  const allTags = allTopLevel.value.flatMap(item => 
    splitTags(item.category)
  )
  return ['全部分类', ...new Set(allTags)]
})

const filteredSorted = computed(() => {
  let list = allTopLevel.value
  if (selectedCategory.value !== '全部分类') {
    list = list.filter(item => splitTags(item.category).includes(selectedCategory.value))
  }
  return list.slice().sort((a, b) => {
    const dateA = a.document_date || a.created_at
    const dateB = b.document_date || b.created_at
    return new Date(dateB) - new Date(dateA)
  })
})

const visibleResources = computed(() => filteredSorted.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredSorted.value.length)
const loadMore = () => { visibleCount.value += PAGE_SIZE }

// 监听分类过滤重置分页
watch(selectedCategory, () => { visibleCount.value = PAGE_SIZE })

// 1. 获取全局系统配置
const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/public-settings`)
    if (res.ok) {
      const data = await res.json()
      if (data.settings) {
        publicSettings.value = data.settings
      }
    }
  } catch (err) {
    console.error('获取系统全局设置失败', err)
  }
}

// 2. 获取学术资源列表
const fetchResources = async () => {
  isLoading.value = true
  try {
    const res = await fetch(`${API_BASE}/api/resources?module=knowledge`)
    if (res.ok) {
      const data = await res.json()
      resources.value = data.resources || []
    }
  } catch (err) {
    console.error('调取资源列表异常', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSettings()
  fetchResources()
})

// 4. 文件体积转换格式化
const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

// 5. 核心：预览与物理下载统一鉴权控制
const handleAccess = async (item, type) => {
  // 未登录拦截
  if (!userStore.token) {
    alert('此项资源需要登记账户权限，请先登录系统调阅。')
    router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  try {
    const res = await fetch(`${API_BASE}/api/resources/${item.id}/access?type=${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    const contentType = res.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const data = await res.json()
      
      if (data.requiresLogin) {
        alert('登录态已失效或需要重新登录')
        userStore.logout?.()
        router.push('/login')
        return
      }

      if (data.external === true) {
        window.open(data.url, '_blank')
        return
      }

      openPaymentModal(item, type, data)
    } else {
      const blob = await res.blob()
      const fileUrl = URL.createObjectURL(blob)

      if (type === 'download') {
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = item.file_name || item.title
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(fileUrl)
      } else {
        window.open(fileUrl, '_blank')
      }
    }
  } catch (err) {
    console.error('资源鉴权交互异常', err)
    alert('调取资源授权失败，请稍后重试。')
  }
}

// 打开支付窗口
const openPaymentModal = (item, type, data) => {
  paymentModal.value = {
    show: true,
    resource: item,
    type: type,
    price: type === 'view' ? data.view_price : data.download_price
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>