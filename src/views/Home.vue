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

    <!-- 2 & 2.5 合并后的：最新公告与限量邀请码左右双栏双翼面板 -->
    <section 
      v-if="notices.length > 0 || inviteCodes.length > 0" 
      class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
    >
      <div 
        :class="[
          'grid grid-cols-1 gap-6',
          (notices.length > 0 && inviteCodes.length > 0) ? 'md:grid-cols-2' : ''
        ]"
      >
        <!-- 左栏：最新公告 (仅当有公告数据时渲染) -->
        <div 
          v-if="notices.length > 0" 
          :class="[
            'space-y-3',
            (inviteCodes.length > 0) ? 'md:border-r md:border-gray-100 md:pr-6' : ''
          ]"
        >
          <!-- 调整后的公告精简小标题 -->
          <div class="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
            <span>📢</span>
            <span>最新公告</span>
          </div>
          <!-- 紧凑单行公告列表 -->
          <div class="space-y-1">
            <div 
              v-for="notice in notices" 
              :key="notice.id"
              class="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex items-center space-x-2 min-w-0 flex-grow">
                <span class="text-xs text-blue-900 flex-shrink-0">📢</span>
                <h3 class="font-bold text-gray-800 text-xs sm:text-sm truncate" :title="notice.title">
                  {{ notice.title }}
                </h3>
              </div>
              <div class="text-[11px] text-gray-400 font-mono flex-shrink-0 whitespace-nowrap">
                {{ formatDate(notice.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 右栏：限量邀请码 (仅当有邀请码时渲染) -->
        <div v-if="inviteCodes.length > 0" class="flex flex-col justify-between">
          <div>
            <!-- 调整后的精简标题 -->
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>🎫</span>
                <span>限量邀请码，先用先得</span>
              </h3>
              <router-link 
                to="/register" 
                class="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center transition"
              >
                立即注册 <span class="ml-1">→</span>
              </router-link>
            </div>

            <!-- 横向循环滚动跑马灯容器 (去除了灰色卡片样式，纯靠外层白底衬托) -->
            <div class="relative w-full overflow-hidden py-2">
              <div class="marquee-track flex gap-4">
                <!-- 第一组邀请码队列 -->
                <div class="flex gap-4 shrink-0 marquee-content">
                  <div 
                    v-for="(item, idx) in inviteCodes" 
                    :key="'a-' + idx"
                    :class="[
                      item.status === 'available' 
                        ? 'bg-white border border-blue-100 text-blue-900 shadow-xs' 
                        : 'bg-gray-100 border border-gray-200 text-gray-400 shadow-none'
                    ]"
                    class="flex items-center space-x-2 px-3 py-1.5 rounded-xl shrink-0"
                  >
                    <span 
                      class="font-mono font-bold text-xs tracking-wide" 
                      :class="{'line-through opacity-70': item.status === 'exhausted'}"
                    >
                      {{ item.code }}
                    </span>
                    <span 
                      v-if="item.status === 'available'" 
                      class="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
                    >
                      余量: {{ item.max_uses - item.used_count }} 次
                    </span>
                    <button 
                      v-if="item.status === 'available'" 
                      @click="copyInviteCode(item.code)"
                      class="text-[11px] px-1.5 py-0.5 bg-blue-900 text-white hover:bg-blue-800 rounded font-bold transition duration-150"
                    >
                      复制
                    </button>
                    <span v-else class="text-[10px] text-gray-400 font-semibold italic whitespace-nowrap">已用完</span>
                  </div>
                </div>

                <!-- 第二组邀请码队列 (首尾无缝拼接) -->
                <div class="flex gap-4 shrink-0 marquee-content" aria-hidden="true">
                  <div 
                    v-for="(item, idx) in inviteCodes" 
                    :key="'b-' + idx"
                    :class="[
                      item.status === 'available' 
                        ? 'bg-white border border-blue-100 text-blue-900 shadow-xs' 
                        : 'bg-gray-100 border border-gray-200 text-gray-400 shadow-none'
                    ]"
                    class="flex items-center space-x-2 px-3 py-1.5 rounded-xl shrink-0"
                  >
                    <span 
                      class="font-mono font-bold text-xs tracking-wide" 
                      :class="{'line-through opacity-70': item.status === 'exhausted'}"
                    >
                      {{ item.code }}
                    </span>
                    <span 
                      v-if="item.status === 'available'" 
                      class="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
                    >
                      余量: {{ item.max_uses - item.used_count }} 次
                    </span>
                    <button 
                      v-if="item.status === 'available'" 
                      @click="copyInviteCode(item.code)"
                      class="text-[11px] px-1.5 py-0.5 bg-blue-900 text-white hover:bg-blue-800 rounded font-bold transition duration-150"
                    >
                      复制
                    </button>
                    <span v-else class="text-[10px] text-gray-400 font-semibold italic whitespace-nowrap">已用完</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 实时数字统计指标面板 -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center">
      <div class="flex flex-col justify-center py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">在线工具</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900 animate-pulse-light">
          {{ loading ? '加载中...' : `${toolCount} 款` }}
        </p>
      </div>
      <div class="flex flex-col justify-center border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">注册用户</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900 animate-pulse-light">
          {{ loading ? '加载中...' : `${userCount} 人` }}
        </p>
      </div>
      <div class="flex flex-col justify-center py-2">
        <p class="text-xs text-gray-500 uppercase font-bold tracking-wider">持续更新</p>
        <p class="mt-1 text-3xl font-extrabold text-blue-900">2026 年上线</p>
      </div>
    </section>

    <!-- 4. 四个核心功能卡片板块 -->
    <section>
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900">核心功能板块</h2>
        <p class="mt-2 text-gray-600">高效赋能基础设施规划前期调研、精细化设计与多指标校核</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <router-link to="/tools" class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
          <div>
            <div class="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-900 mb-4">
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
          <span class="text-sm font-semibold text-blue-800 flex items-center">开始计算 <span class="ml-1">→</span></span>
        </router-link>
        <router-link to="/policy" class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
          <div>
            <div class="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-900 mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">政策库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">
              支持上传国土空间规划、传统市政规划、综合管廊、海绵城市、绿色基础设施等多类型 PDF 政策，依托大模型 AI 技术，快速生成条文提炼。
            </p>
          </div>
          <span class="text-sm font-semibold text-indigo-800 flex items-center">开始解析 <span class="ml-1">→</span></span>
        </router-link>
        <router-link to="/library" class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
          <div>
            <div class="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-green-900 mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">资料库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">收录最新国家、行业、地方级城市规划资料与标准规范。</p>
          </div>
          <span class="text-sm font-semibold text-green-800 flex items-center">去资料库 <span class="ml-1">→</span></span>
        </router-link>
        <router-link to="/knowledge" class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between">
          <div>
            <div class="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-800 mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">知识库</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-4">沉淀城市基础设施、城市更新及韧性城市设计的前沿学术笔记。为城市基础设施规划研究爱好者提供强大的学术资源支持。</p>
          </div>
          <span class="text-sm font-semibold text-yellow-800 flex items-center">进入知识库 <span class="ml-1">→</span></span>
        </router-link>
      </div>
    </section>

    <!-- 5. 平台三大特点区 -->
    <section class="bg-gray-100 rounded-2xl p-8 sm:p-12 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">工具多样</h4>
            <p class="text-sm text-gray-600 leading-relaxed">专为城市基础设施规划研究人员服务，减少日常繁杂工作，实现工具一站式查找，涵盖雨水、消防、市政承载力等专业计算方法。</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">内容专业</h4>
            <p class="text-sm text-gray-600 leading-relaxed">聚焦城市基础设施规划研究领域，对内部科研核心规划成果与上传文件采取严格的审查机制。</p>
          </div>
        </div>
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 h-10 w-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
            </svg>
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-1">持续更新</h4>
            <p class="text-sm text-gray-600 leading-relaxed">不断收录全国各省市最新颁布的规划设计技术规程/标准/规范，紧跟政策形势。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 🆕 6. 右下角悬浮"优化建议"按钮 -->
    <button 
      @click="openFeedbackModal"
      class="fixed right-6 bottom-6 z-40 h-14 w-14 bg-gradient-to-br from-[#1e3a5f] to-[#12253f] hover:from-yellow-500 hover:to-yellow-400 text-white hover:text-gray-900 rounded-full shadow-lg hover:shadow-xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 group border border-blue-800 hover:border-yellow-300"
      title="优化建议"
    >
      <span class="text-xl group-hover:animate-bounce">💡</span>
      <span class="text-[9px] font-extrabold tracking-wider -mt-0.5">建议</span>
    </button>

    <!-- 🆕 7. 优化建议提交模态弹窗 (Modal) -->
    <div 
      v-if="showFeedbackModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <!-- 头部 -->
        <div class="bg-[#1e3a5f] text-white px-6 py-4 flex justify-between items-center">
          <h3 class="font-bold text-base flex items-center space-x-2">
            <span>💡</span>
            <span>提交优化建议</span>
          </h3>
          <button 
            @click="showFeedbackModal = false" 
            class="text-white/80 hover:text-white text-lg font-light transition"
          >
            ✕
          </button>
        </div>
        <!-- 主体 -->
        <form @submit.prevent="handleSubmitFeedback" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">建议与想法反馈 *</label>
            <textarea 
              v-model="feedbackContent"
              rows="6"
              maxlength="500"
              required
              placeholder="请在这里写下您的系统改进建议、期望新增的基础设施计算工具或规范数据等..."
              class="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none leading-relaxed text-gray-800"
            ></textarea>
            <div class="text-right text-xxs text-gray-400 mt-1 font-mono">
              {{ feedbackContent.length }}/500 字
            </div>
          </div>
          <!-- 底部动作 -->
          <div class="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              @click="showFeedbackModal = false" 
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
            >
              取消
            </button>
            <button 
              type="submit" 
              :disabled="feedbackSubmitting"
              class="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-450 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center min-w-[100px]"
            >
              {{ feedbackSubmitting ? '提交中...' : '提交建议' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getStats } from '../utils/api'

const router = useRouter()
const userStore = useUserStore()

const toolCount = ref(0)
const userCount = ref(0)
const loading = ref(true)
const notices = ref([])
const inviteCodes = ref([])

// 优化建议响应状态
const showFeedbackModal = ref(false)
const feedbackContent = ref('')
const feedbackSubmitting = ref(false)

const formatDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.split('T')[0]
}

const truncateContent = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// 物理复制邀请码到剪贴板
const copyInviteCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert(`已复制邀请码：${code}，可前往注册页粘贴使用`)
  } catch (err) {
    console.error('复制邀请码失败:', err)
    alert('复制失败，请手动选择复制邀请码: ' + code)
  }
}

// 检查是否登录并开启反馈表单
const openFeedbackModal = () => {
  if (!userStore.isLoggedIn) {
    alert('请先登录后再提交建议')
    router.push('/login')
  } else {
    feedbackContent.value = ''
    showFeedbackModal.value = true
  }
}

// 提交反馈数据流
const handleSubmitFeedback = async () => {
  const contentTrimmed = feedbackContent.value.trim()
  if (!contentTrimmed) {
    alert('请输入建议内容')
    return
  }

  feedbackSubmitting.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('https://api.urbancopilot.qzz.io/api/feedback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: contentTrimmed })
    })
    
    if (res.ok) {
      alert('感谢您的建议，我们会认真考虑！')
      feedbackContent.value = ''
      showFeedbackModal.value = false
    } else {
      const errData = await res.json().catch(() => ({}))
      alert(errData.error || '提交反馈建议失败，请稍后再试。')
    }
  } catch (err) {
    console.error('反馈接口调用异常:', err)
    alert('与建议反馈网关建立连接失败，请检查您的网络。')
  } finally {
    feedbackSubmitting.value = false
  }
}

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

  try {
    const noticeRes = await fetch('https://api.urbancopilot.qzz.io/api/notices')
    const noticeData = await noticeRes.json()
    notices.value = (noticeData.notices || []).slice(0, 3)
  } catch (err) {
    console.error('获取首页最新公告失败:', err)
  }

  // 🆕 异步获取前台可用邀请码序列
  try {
    const codesRes = await fetch('https://api.urbancopilot.qzz.io/api/invite-codes/public')
    const codesData = await codesRes.json()
    inviteCodes.value = codesData.codes || []
  } catch (err) {
    console.error('获取首页公开邀请码失败:', err)
  }
})
</script>

<style scoped>
.animate-pulse-light {
  animation: pulseLight 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulseLight {
  0%, 100% { opacity: 1; }
  50% { opacity: .7; }
}

/* 跑马灯滚动关键帧与硬件加速 */
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 40s linear infinite;
  will-change: transform;
}
.marquee-content {
  display: flex;
}
.marquee-track:hover .marquee-content {
  animation-play-state: paused;
}
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 弹窗及遮罩进场动画 */
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>