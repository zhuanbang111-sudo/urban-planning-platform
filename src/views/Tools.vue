<!-- 保存路径: src/views/Tools.vue -->
<template>
  <div class="space-y-6">
    
    <!-- 1. 页面标题 + 面包屑导航 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-blue-900">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">规划工具与表格</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900">规划工具与表格</h1>
      <p class="text-sm text-gray-600 mt-1">集成暴雨雨水计算工具与专业规划协作表格，助力市政工程方案设计。</p>
    </div>

    <!-- 2. Tab 切换栏 -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Tabs">
        <!-- 规划计算工具 Tab -->
        <button 
          @click="activeTab = 'calculators'"
          :class="[
            activeTab === 'calculators' 
              ? 'border-blue-900 text-blue-900 font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          class="py-4 px-1 border-b-2 font-medium text-base focus:outline-none transition-all duration-200"
        >
          规划计算工具
        </button>

        <!-- 规划表格 Tab -->
        <button 
          @click="activeTab = 'tables'"
          :class="[
            activeTab === 'tables' 
              ? 'border-blue-900 text-blue-900 font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
          class="py-4 px-1 border-b-2 font-medium text-base focus:outline-none transition-all duration-200"
        >
          规划表格
        </button>
      </nav>
    </div>

    <!-- 3. Tab1 内容：工具卡片网格 -->
    <div v-show="activeTab === 'calculators'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 animate-fade-in">
      
      <!-- 卡片1：雨水径流计算 (已上线) -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="h-12 w-12 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center">
              <!-- 雨水滴图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">已上线</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">雨水径流计算</h3>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            基于中国市政雨水设计规范，输入暴雨强度公式参数、集水面积、径流系数及汇流时间，快速演算雨水设计流量及调蓄规模。
          </p>
        </div>
        <button 
          @click="navigateToStormwater"
          class="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm text-center text-sm transition-colors duration-200"
        >
          立即使用
        </button>
      </div>

      <!-- 卡片2：管网水力计算 (即将上线) -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-between opacity-75">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="h-12 w-12 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center">
              <!-- 管网管道图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
              </svg>
            </div>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">即将上线</span>
          </div>
          <h3 class="text-lg font-bold text-gray-500 mb-2">管网水力计算</h3>
          <p class="text-sm text-gray-400 leading-relaxed mb-6">
            提供重力流管渠与压力流管网的水力坡降计算、管径反算、充满度核算工具，内置海澄-威廉（Hazen-Williams）粗糙度数据库。
          </p>
        </div>
        <button 
          disabled
          class="w-full py-2.5 bg-gray-300 text-gray-500 font-medium rounded-lg text-center text-sm cursor-not-allowed"
        >
          未开放
        </button>
      </div>

      <!-- 卡片3：竖向规划计算 (即将上线) -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col justify-between opacity-75">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div class="h-12 w-12 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center">
              <!-- 竖向高程等高线图标 -->
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
            </div>
            <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">即将上线</span>
          </div>
          <h3 class="text-lg font-bold text-gray-500 mb-2">竖向规划计算</h3>
          <p class="text-sm text-gray-400 leading-relaxed mb-6">
            结合高程、坡度及用地特征，快速计算场地平均坡度、土石方挖填平衡量及地表截流边沟断面规格，支持多重约束。
          </p>
        </div>
        <button 
          disabled
          class="w-full py-2.5 bg-gray-300 text-gray-500 font-medium rounded-lg text-center text-sm cursor-not-allowed"
        >
          未开放
        </button>
      </div>

    </div>

    <!-- 4. Tab2 内容：规划表格 -->
    <div v-show="activeTab === 'tables'" class="space-y-4 py-4 animate-fade-in">
      
      <!-- 提示条：未登录时显示 -->
      <div v-if="!isLoggedIn" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-center space-x-3">
        <svg class="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-yellow-800 font-medium">
          温馨提示：您当前处于未登录状态。您可以下载表格，但【登录后】系统才可永久保存您的历史表格计算记录。
        </span>
      </div>

      <!-- 表格列表 -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th scope="col" class="px-6 py-4 text-left font-semibold">表格名称</th>
              <th scope="col" class="px-6 py-4 text-left font-semibold">类型</th>
              <th scope="col" class="px-6 py-4 class text-center font-semibold w-32">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-sm text-gray-700">
            <!-- 行 1 -->
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <span class="text-green-600">📊</span>
                  <span class="font-medium text-gray-900">雨水设施规模计算表.xlsx</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800">市政给排水</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button 
                  @click="handleDownload('雨水设施规模计算表.xlsx')"
                  class="text-blue-900 hover:text-blue-700 text-sm font-semibold flex items-center justify-center space-x-1"
                >
                  <span>下载</span>
                </button>
              </td>
            </tr>

            <!-- 行 2 -->
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <span class="text-green-600">📊</span>
                  <span class="font-medium text-gray-900">管网水力计算表.xlsx</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-0.5 text-xs rounded bg-purple-100 text-purple-800">管网水力学</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button 
                  @click="handleDownload('管网水力计算表.xlsx')"
                  class="text-blue-900 hover:text-blue-700 text-sm font-semibold flex items-center justify-center space-x-1"
                >
                  <span>下载</span>
                </button>
              </td>
            </tr>

            <!-- 行 3 -->
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <span class="text-green-600">📊</span>
                  <span class="font-medium text-gray-900">竖向规划计算表.xlsx</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">城市竖向规划</span>
              </td>
              <td class="px-6 py-4 text-center">
                <button 
                  @click="handleDownload('竖向规划计算表.xlsx')"
                  class="text-blue-900 hover:text-blue-700 text-sm font-semibold flex items-center justify-center space-x-1"
                >
                  <span>下载</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态参数
const activeTab = ref('calculators')
const isLoggedIn = ref(false)

// 组件挂载时检查是否已登录，用于调整表格Tab下的友情提示显示
onMounted(() => {
  isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true'
})

// 卡片 1 的跳转逻辑
const navigateToStormwater = () => {
  router.push('/tools/stormwater')
}

// 模拟下载表格操作
const handleDownload = (tableName) => {
  alert(`已开始下载：${tableName}\n(已拉起系统内置防灾计算表格模块)`)
}
</script>

<style scoped>
/* 局部简单的动效 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>