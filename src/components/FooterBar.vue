<!-- 保存路径: src/components/FooterBar.vue -->
<template>
  <footer class="bg-[#1e3a5f] text-gray-200 border-t-4 border-yellow-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 左侧 -->
        <div class="flex flex-col space-y-3">
          <div class="flex items-center space-x-2">
            <svg class="h-6 w-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="text-lg font-bold tracking-wider text-white">城市规划研究平台</span>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed max-w-sm">
            本平台致力于为城市规划师提供智能、高效、数据驱动的辅助计算与分析工具。
          </p>
        </div>
        <!-- 中间 -->
        <div class="flex flex-col space-y-3">
          <span class="text-sm font-semibold tracking-wider text-white uppercase border-b border-blue-900 pb-2">快速链接</span>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <router-link to="/" class="hover:text-yellow-400 transition-colors">▶ 平台首页</router-link>
            <router-link to="/tools" class="hover:text-yellow-400 transition-colors">▶ 工具与表格</router-link>
            <router-link to="/policy" class="hover:text-yellow-400 transition-colors">▶ 政策分析</router-link>
            <router-link to="/library" class="hover:text-yellow-400 transition-colors">▶ 标准资料库</router-link>
          </div>
        </div>
        <!-- 右侧 -->
        <div class="flex flex-col space-y-3">
          <span class="text-sm font-semibold tracking-wider text-white uppercase border-b border-blue-900 pb-2">单位信息</span>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>单位：【TODO: 请填写您的单位名称】</li>
            <li>邮箱：contact@urbanplanning.org</li>
          </ul>
        </div>
      </div>
      <!-- 版权栏 -->
      <div class="border-t border-blue-900 mt-8 pt-6 text-center text-xs text-gray-400">
        <span>© 2025 城市规划研究平台. 保留所有权利。</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>