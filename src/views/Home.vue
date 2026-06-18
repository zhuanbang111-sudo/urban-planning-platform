<!-- 保存路径: src/views/Home.vue -->
<template>
  <div class="space-y-12">
    
    <!-- 1. Hero 区域 (主视觉区) -->
    <section class="bg-gradient-to-r from-[#1e3a5f] to-[#12253f] text-white rounded-2xl shadow-xl overflow-hidden">
      <div class="px-6 py-16 sm:px-12 lg:px-20 text-center max-w-4xl mx-auto">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          城市基础设施规划研究一站式平台
        </h1>
        <p class="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8">
          整合计算工具、政策文件、标准规范、知识资料库，<br class="hidden sm:inline" />
          全方位服务市政基础设施规划研究，助力规划研究决策。
        </p>
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
          <router-link 
            to="/tools" 
            class="w-full sm:w-auto px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center"
          >
            进入工具中心
          </router-link>
          <router-link 
            to="/library" 
            class="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-semibold rounded-lg transition-all duration-200 text-center"
          >
            浏览资料库
          </router-link>
        </div>
      </div>
    </section>

    <!-- 2. 新增：实时数字统计指标面板 -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center">
      <!-- 统计项 1 -->
      <div class="flex flex-col justify-center py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">在线工具</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900 animate-pulse-light">
          {{ loading ? '加载中...' : `${toolCount} 款` }}
        </p>
      </div>
      <!-- 统计项 2 (带左右边线分割) -->
      <div class="flex flex-col justify-center border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">注册用户</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900 animate-pulse-light">
          {{ loading ? '加载中...' : `${userCount} 人` }}
        </p>
      </div>
      <!-- 统计项 3 -->
      <div class="flex flex-col justify-center py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">持续更新</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900">2026 年上线</p>
      </div>
    </section>

    <!-- 3. 四个核心功能卡片板块 -->
    <section>
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900">核心功能板块</h2>
        <p class="mt-2 text-gray-600">高效赋能基础设施规划前期调研、精细化设计与多指标校核</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- 卡片 1: 规划工具与表格 (已绑定动态统计数并链接跳转) -->
        <router-link 
          to="/tools"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <div class="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-900 mb-4">
              <!-- 规划计算器图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">工具库</h3>
            <p class="text-sm font-semibold text-blue-900 mb-2">
              {{ loading ? '工具同步中...' : `${toolCount} 款专业计算工具，持续更新中` }}
            </p>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              内置专业工具，助力基础设施规划研究过程中，数据处理、雨水径流计算、水力学参数演进公式等。
            </p>
          </div>
          <span class="text-sm font-semibold text-blue-800 flex items-center">
            开始计算 <span class="ml-1">→</span>
          </span>
        </router-link>

        <!-- 卡片 2: 政策文件分析 -->
        <router-link 
          to="/policy"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <div class="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-900 mb-4">
              <!-- 政策AI解析图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">政策库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              支持上传国土空间规划、传统市政规划、综合管廊、海绵城市、绿色基础设施等多类型 PDF 政策，依托大模型 AI 技术，快速生成条文提炼。
            </p>
          </div>
          <span class="text-sm font-semibold text-indigo-800 flex items-center">
            开始解析 <span class="ml-1">→</span>
          </span>
        </router-link>

        <!-- 卡片 3: 标准规范资料库 -->
        <router-link 
          to="/library"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <div class="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-green-900 mb-4">
              <!-- 规范资料库图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">资料库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              收录最新国家、行业、地方级城市规划资料与标准规范。
            </p>
          </div>
          <span class="text-sm font-semibold text-green-800 flex items-center">
            去资料库 <span class="ml-1">→</span>
          </span>
        </router-link>

        <!-- 卡片 4: 规划知识库 -->
        <router-link 
          to="/knowledge"
          class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <div class="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-800 mb-4">
              <!-- 规划知识库图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">知识库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              沉淀城市基础设施、城市更新及韧性城市设计的前沿学术笔记。为城市基础设施规划研究爱好者提供强大的学术资源支持。
            </p>
          </div>
          <span class="text-sm font-semibold text-yellow-800 flex items-center">
            进入知识库 <span class="ml-1">→</span>
          </span>
        </router-link>

      </div>
    </section>

    <!-- 4. 平台三大特点区 -->
    <section class="bg-gray-100 rounded-2xl p-8 sm:p-12 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- 特点 1 -->
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">工具多样</h4>
            <p class="text-sm text-gray-600 leading-relaxed">
              专为城市基础设施规划研究人员服务，减少日常繁杂工作，实现工具一站式查找，涵盖雨水、消防、市政承载力等专业计算方法。
            </p>
          </div>
        </div>

        <!-- 特点 2 -->
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">内容专业</h4>
            <p class="text-sm text-gray-600 leading-relaxed">
              聚焦城市基础设施规划研究领域，对内部科研核心规划成果与上传文件采取严格的审查机制。
            </p>
          </div>
        </div>

        <!-- 特点 3 -->
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">持续更新</h4>
            <p class="text-sm text-gray-600 leading-relaxed">
              不断收录全国各省市最新颁布的规划设计技术规程/标准/规范，紧跟政策形势。
            </p>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '../utils/api' // 引入之前写好的公开统计接口

// 响应式数据
const toolCount = ref(0)
const userCount = ref(0)
const loading = ref(true)

// 生命周期挂载：从 Cloudflare 边缘端同步真实统计指标
onMounted(async () => {
  try {
    const res = await getStats()
    toolCount.value = res.tool_count || 0
    userCount.value = res.user_count || 0
  } catch (err) {
    console.error('获取首页统计数据失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 骨架屏淡雅微调加载呼吸动画 */
.animate-pulse-light {
  animation: pulseLight 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseLight {
  0%, 100% { opacity: 1; }
  50% { opacity: .7; }
}
</style>