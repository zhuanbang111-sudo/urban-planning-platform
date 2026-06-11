<!-- 保存路径: src/views/Policy.vue -->
<template>
  <div class="space-y-6">
    
    <!-- 面包屑及标题 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-blue-900">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">政策文件分析</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900">政策文件分析</h1>
      <p class="text-sm text-gray-600 mt-1">上传 PDF 规划政策文件，使用 AI 大模型提炼关键指标与条文要素。</p>
    </div>

    <!-- 占位主体卡片 -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto my-8">
      <!-- 带有动态悬浮效果的 AI 与文档图标 -->
      <div class="mx-auto h-20 w-20 text-blue-900 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6M9 16h6M9 8h6" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-3">AI 政策解析功能开发中</h2>
      <p class="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
        我们正在对接高效本地化大语言模型接口。未来您只需直接拖拽上传国土空间规划、海绵城市建设导则等 PDF 文档，系统即可在一分钟内自动提取指标、列出强制性条文并生成报告大纲。敬请期待！
      </p>

      <!-- 返回首页按钮 -->
      <router-link 
        to="/" 
        class="inline-flex items-center px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow transition-colors duration-200 text-sm"
      >
        <span class="mr-2">←</span> 返回系统首页
      </router-link>
    </div>

  </div>
</template>

<script setup>
// 占位页面逻辑保持精简
</script>

<style scoped>
/* 占位呼吸效果 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .8; transform: scale(1.05); }
}
</style>