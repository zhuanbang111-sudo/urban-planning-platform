<!-- 保存路径: src/views/Tools.vue -->
<template>
  <div class="space-y-6">
    
    <!-- ========================================================= -->
    <!-- 【状态 1：工具列表状态】 -->
    <!-- ========================================================= -->
    <div v-if="!activeTool" class="space-y-6 animate-fade-in">
      <!-- 页面标题与面包屑 -->
      <div class="border-b border-gray-200 pb-4">
        <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
          <router-link to="/" class="hover:text-blue-900">首页</router-link>
          <span>&gt;</span>
          <span class="text-gray-800 font-medium">规划工具库</span>
        </nav>
        <h1 class="text-3xl font-bold text-gray-900">规划工具库</h1>
        <p class="text-sm text-gray-600 mt-1">内置市政、道路及给排水高阶规划计算工具。登录后可解锁保存计算记录权限。</p>
      </div>

      <!-- 分类筛选 Tab 栏 -->
      <div class="border-b border-gray-100 pb-1">
        <nav class="flex space-x-4 overflow-x-auto pb-2" aria-label="Tabs">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="handleCategoryChange(cat)"
            :class="[
              selectedCategory === cat
                ? 'bg-blue-900 text-white font-semibold'
                : 'bg-white text-gray-600 hover:text-blue-900 hover:bg-gray-100 border border-gray-200'
            ]"
            class="px-4 py-2 rounded-lg text-sm transition-all duration-200 whitespace-nowrap focus:outline-none"
          >
            {{ cat }}
          </button>
        </nav>
      </div>

      <!-- 工具加载提示 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mb-3"></div>
        <p class="text-sm text-gray-500">正在调取云端工具数据，请稍候...</p>
      </div>

      <!-- 无工具占位图 -->
      <div v-else-if="filteredTools.length === 0" class="text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm">
        <span class="text-4xl">🛠</span>
        <h3 class="text-lg font-bold text-gray-800 mt-4">该类目下暂无上线工具</h3>
        <p class="text-sm text-gray-500 mt-1">请尝试切换其他分类或联系管理员反馈需求。</p>
      </div>

      <!-- 工具卡片网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="tool in filteredTools"
          :key="tool.id"
          @click="handleToolClick(tool)"
          :class="[
            tool.status === 'active' 
              ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer bg-white' 
              : 'bg-gray-50 opacity-70 cursor-not-allowed'
          ]"
          class="border border-gray-200 rounded-xl p-6 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <!-- 大号 Emoji 图标 -->
              <span class="text-3xl p-2 bg-gray-100 rounded-lg">{{ tool.icon || '🛠' }}</span>
              <!-- 分类标签 -->
              <span class="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-900 font-medium">
                {{ tool.category }}
              </span>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ tool.name }}</h3>
            <!-- 限制最多显示三行描述 -->
            <p class="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
              {{ tool.description }}
            </p>
          </div>

          <div class="flex items-center justify-between border-t border-gray-100 pt-4">
            <!-- 上线状态 -->
            <span 
              :class="[
                tool.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-200 text-gray-600'
              ]"
              class="px-2.5 py-0.5 text-xs font-semibold rounded-full"
            >
              {{ tool.status === 'active' ? '已上线' : '即将上线' }}
            </span>
            <span class="text-xs font-semibold text-blue-900 flex items-center hover:underline">
              {{ tool.status === 'active' ? '立即进入' : '敬请期待' }} <span class="ml-1">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 【状态 2：工具运行状态 (iframe 内嵌)】 -->
    <!-- ========================================================= -->
    <div v-else class="flex flex-col border border-gray-200 rounded-2xl overflow-hidden shadow-lg animate-fade-in">
      
      <!-- 顶部固定工具栏 -->
      <div class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between z-10">
        <button 
          @click="exitTool" 
          class="flex items-center text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <span class="mr-2">←</span> 返回工具列表
        </button>
        
        <h2 class="text-base font-bold text-white tracking-wider flex items-center space-x-2">
          <span class="text-lg">{{ activeTool.icon }}</span>
          <span>{{ activeTool.name }}</span>
        </h2>

        <div>
          <!-- 如果是外部链接，才提供“在新窗口打开”的按钮 -->
          <button 
            v-if="activeTool.tool_type === 'iframe_external'"
            @click="openInNewWindow"
            class="px-3 py-1 bg-blue-800 hover:bg-blue-700 text-xs font-bold rounded text-white transition-all shadow-sm"
          >
            在新窗口打开 ↗
          </button>
          <div v-else class="w-20"></div> <!-- 占位保持排版对称 -->
        </div>
      </div>

      <!-- iframe 主体加载区 -->
      <div class="relative w-full bg-white" :style="{ height: iframeHeight }">
        <!-- 内置加载中 Loading 动画 -->
        <div v-if="iframeLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
          <p class="text-sm font-semibold text-gray-600">正在安全沙箱中加载规划工具模型...</p>
        </div>

        <!-- iframe 核心节点 -->
        <iframe
          :src="activeTool.url"
          class="w-full h-full border-none"
          scrolling="yes"
          @load="handleIframeLoaded"
        ></iframe>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 【优雅的 Tailwind 风格登录提示遮罩弹窗】 -->
    <!-- ========================================================= -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-pop-in">
        <div class="text-center">
          <span class="text-4xl">🔐</span>
          <h3 class="text-xl font-bold text-gray-900 mt-4">需要登录才能继续</h3>
          <p class="text-sm text-gray-500 mt-2 leading-relaxed">
            该规划计算工具包含专业市政计算资源与存储额度，请先登录您的平台账户。
          </p>
        </div>
        <div class="mt-6 flex space-x-3">
          <button 
            @click="showLoginModal = false" 
            class="flex-1 py-2 border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 text-sm transition-all"
          >
            取消
          </button>
          <button 
            @click="goToLogin" 
            class="flex-1 py-2 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 text-sm transition-all shadow-md"
          >
            去登录
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user' // 引用状态管理
import { getTools, accessTool } from '../utils/api' // 引用 API 方法

const router = useRouter()
const userStore = useUserStore()

// 状态参数
const loading = ref(false)
const iframeLoading = ref(true)
const showLoginModal = ref(false)
const tools = ref([])
const selectedCategory = ref('全部')
const activeTool = ref(null) // 存放当前运行的工具对象

// 静态筛选项
const categories = ['全部', '排水工程', '消防工程', '道路工程', '更多']

// iframe 高度适配机制 (视口高度减去导航和工具条)
const iframeHeight = computed(() => {
  return 'calc(100vh - 16rem)' // 响应式安全高度适配
})

// 根据分类筛选工具列表
const filteredTools = computed(() => {
  return tools.value
})

// 初始化拉取云端工具数据
const fetchToolsData = async (cat = '全部') => {
  loading.value = true
  try {
    const res = await getTools(cat)
    tools.value = res.tools || []
  } catch (err) {
    console.error('获取工具列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 切换分类
const handleCategoryChange = async (cat) => {
  selectedCategory.value = cat
  await fetchToolsData(cat)
}

// 处理卡片点击逻辑
const handleToolClick = async (tool) => {
  // 1. 如果工具未激活，拦截提示
  if (tool.status !== 'active') {
    alert('提示：该规划工具正在紧张模型调校中，敬请期待！')
    return
  }

  // 2. 如果工具需要登录，且用户处于未登录状态，拦截弹出优雅弹窗
  if (Number(tool.min_level ?? 0) > 0 && !userStore.isLoggedIn) {
    showLoginModal.value = true
    return
  }

  // 3. 已登录，向后端请求安全认证及权限核验
  try {
    const res = await accessTool(tool.id)
    if (res.success) {
      // 切换到【状态 2】，开启内嵌
      activeTool.value = {
        name: res.name,
        url: res.url,
        tool_type: res.tool_type,
        icon: tool.icon
      }
      iframeLoading.value = true // 重置 Loading 状态
    }
  } catch (err) {
    // 处理 403 权限越界或其他错误
    if (err.response && err.response.status === 403) {
      alert('您的下载/计算权限不足，请联系管理员升级您的权限组！')
    } else {
      alert('工具加载失败：' + (err.response?.data?.error || '网络异常'))
    }
  }
}

// 退出工具内嵌，退回【状态 1】
const exitTool = () => {
  activeTool.value = null
}

// 在新窗口打开外部工具
const openInNewWindow = () => {
  if (activeTool.value && activeTool.value.url) {
    window.open(activeTool.value.url, '_blank')
  }
}

// iframe 节点加载完毕，取消 loading 遮罩
const handleIframeLoaded = () => {
  iframeLoading.value = false
}

// 弹窗点击跳转登录页并带上返回来源参数
const goToLogin = () => {
  showLoginModal.value = false
  router.push({
    path: '/login',
    query: { redirect: '/tools' }
  })
}

// 生命周期挂载加载
onMounted(() => {
  fetchToolsData('全部')
})
</script>

<style scoped>
/* 优雅的淡入淡出动画 */
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 弹窗小卡片缩放动效 */
.animate-pop-in {
  animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>