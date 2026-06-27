<!-- 保存路径: src/views/Library.vue -->
<template>
  <div class="space-y-6">
    <!-- 面包屑及标题 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-green-950">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">标准规范资料库</span>
      </nav>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>📚</span> 标准规范资料库
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            系统收录城市给排水、道路交通、海绵城市施工图集等行业现行及地方推荐性设计标准。
          </p>
        </div>
        <!-- 分类筛选下拉框 -->
        <div class="w-full md:w-64">
          <label class="block text-xs font-semibold text-gray-500 mb-1">专业类型过滤</label>
          <select 
            v-model="selectedCategory"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="isLoading" class="py-12 flex justify-center items-center">
      <div class="flex flex-col items-center gap-3">
        <svg class="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm text-gray-500">正在调阅规范资料名册...</span>
      </div>
    </div>

    <!-- 空列表状态 -->
    <div v-else-if="filteredResources.length === 0" class="py-16 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
      <span class="text-4xl">📂</span>
      <h3 class="text-lg font-bold text-gray-800 mt-4">暂无相关规范图集</h3>
      <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">当前分类下暂未发布任何资料文本，敬请期待系统更新发布。</p>
    </div>

    <!-- 资源列表网格 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="item in filteredResources" 
        :key="item.id"
        class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <!-- 头部：模块图标 + 标题 -->
          <div class="flex items-start gap-2.5 mb-2">
            <span class="text-xl flex-shrink-0">📚</span>
            <h3 class="font-bold text-gray-900 leading-snug line-clamp-2" :title="item.title">
              {{ item.title }}
            </h3>
          </div>

          <!-- 分类标签 -->
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {{ item.category || '未分类' }}
            </span>
            <span class="text-xs text-gray-400">
              大小: {{ formatFileSize(item.file_size) }}
            </span>
          </div>

          <!-- 描述信息 -->
          <p class="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-3" :title="item.description">
            {{ item.description || '暂无详细描述说明。' }}
          </p>
        </div>

        <div>
          <!-- 权限与等级标签 -->
          <div class="flex items-center justify-between border-t border-gray-100 pt-3 mb-4">
            <span class="text-xs text-gray-400">访问权限</span>
            <span 
              v-if="item.min_level === 0" 
              class="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs rounded-md font-semibold"
            >
              公开免费
            </span>
            <span 
              v-else-if="item.min_level === 1" 
              class="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs rounded-md font-semibold"
            >
              登录可看
            </span>
            <span 
              v-else 
              class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md font-semibold"
            >
              仅会员
            </span>
          </div>

          <!-- 功能操作区 -->
          <div v-if="item.source_type === 'external'">
            <button 
              @click="handleAccess(item, 'view')"
              class="w-full px-3 py-2 bg-green-50 hover:bg-green-100 text-green-950 font-medium text-xs rounded-lg transition-colors border border-green-200 flex items-center justify-center gap-1"
            >
              <span>👁️</span>
              <span>{{ item.view_price === 0 ? '前往查看 (免费)' : `前往查看 ¥${(item.view_price / 100).toFixed(2)}` }}</span>
            </button>
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <button 
              @click="handleAccess(item, 'view')"
              class="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-950 font-medium text-xs rounded-lg transition-colors border border-green-200 flex items-center justify-center gap-1"
            >
              <span>👁️</span>
              <span>{{ item.view_price === 0 ? '查看 (免费)' : `查看 ¥${(item.view_price / 100).toFixed(2)}` }}</span>
            </button>
            <button 
              @click="handleAccess(item, 'download')"
              class="px-3 py-2 bg-green-800 hover:bg-green-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>📥</span>
              <span>{{ item.download_price === 0 ? '下载 (免费)' : `下载 ¥${(item.download_price / 100).toFixed(2)}` }}</span>
            </button>
          </div>
        </div>
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
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            💎
          </div>
          <h3 class="text-lg font-bold text-gray-900 px-4">权限支付引导</h3>
          <p class="text-sm text-gray-500 mt-2">
            《{{ paymentModal.resource?.title }}》
          </p>
          <p class="text-xs text-gray-400 mt-1">
            需要获取当前资源的 <span class="font-bold text-green-600">{{ paymentModal.type === 'view' ? '在线预览' : '物理下载' }}</span> 授权
          </p>

          <!-- 价格展示 -->
          <div class="my-5 bg-green-50/50 py-3 rounded-xl border border-green-100">
            <span class="text-xs text-gray-500 block">特许永久授权费用</span>
            <span class="text-3xl font-black text-green-900">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

import wechatQr from '../assets/payment/wechat-qr.png'
import alipayQr from '../assets/payment/alipay-qr.png'

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

// 1. 获取全局系统配置
const fetchSettings = async () => {
  try {
    const res = await fetch('/api/public-settings')
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

// 2. 获取资料资源列表
const fetchResources = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/resources?module=library')
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

// 3. 提取动态去重的分类列表
const categories = computed(() => {
  const cats = resources.value.map(item => item.category).filter(Boolean)
  return ['全部分类', ...new Set(cats)]
})

// 前端本地分类筛选
const filteredResources = computed(() => {
  if (selectedCategory.value === '全部分类') {
    return resources.value
  }
  return resources.value.filter(item => item.category === selectedCategory.value)
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
    const res = await fetch(`/api/resources/${item.id}/access?type=${type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    const contentType = res.headers.get('content-type') || ''
    
    // 如果响应头包含 json，表明没有直连文件权限
    if (contentType.includes('application/json')) {
      const data = await res.json()
      
      if (data.requiresLogin) {
        alert('登录态已失效或需要重新登录')
        userStore.logout?.()
        router.push('/login')
        return
      }

      // 外部链接，通过直接打开
      if (data.external === true) {
        window.open(data.url, '_blank')
        return
      }

      // 唤醒扫码支付
      openPaymentModal(item, type, data)
    } else {
      // 拿到物理文件流并转换
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