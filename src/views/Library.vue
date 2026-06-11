<!-- 保存路径: src/views/Library.vue -->
<template>
  <div class="space-y-6">
    
    <!-- 面包屑及标题 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-blue-900">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">标准规范资料库</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900">标准规范资料库</h1>
      <p class="text-sm text-gray-600 mt-1">提供国家级、行业级、地方级城市规划与给排水规范文本的分级开放下载。</p>
    </div>

    <!-- 占位主体卡片 -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto my-8">
      <!-- 带有动态悬浮效果的图书/资料图标 -->
      <div class="mx-auto h-20 w-20 text-green-800 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-3">资料库归集建设中</h2>
      <p class="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
        我们正在系统收录最新版《室外排水设计标准》、《城市居住区规划设计标准》及各省市海绵城市建设地方规范。后续将结合 Cloudflare R2 存储器提供支持管理员分级控制下载的极速资料库。敬请期待！
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
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .8; transform: scale(1.05); }
}
</style>