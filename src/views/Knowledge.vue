<!-- 保存路径: src/views/Knowledge.vue -->
<template>
  <div class="space-y-6">
    
    <!-- 面包屑及标题 -->
    <div class="border-b border-gray-200 pb-4">
      <nav class="text-sm text-gray-500 mb-2 flex items-center space-x-2">
        <router-link to="/" class="hover:text-blue-900">首页</router-link>
        <span>&gt;</span>
        <span class="text-gray-800 font-medium">规划知识库</span>
      </nav>
      <h1 class="text-3xl font-bold text-gray-900">规划知识库</h1>
      <p class="text-sm text-gray-600 mt-1">沉淀城市基础设施、城市更新及韧性城市设计的前沿学术笔记和最佳案例。</p>
    </div>

    <!-- 占位主体卡片 -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto my-8">
      <!-- 带有动态悬浮效果的搜索/放大镜图标 -->
      <div class="mx-auto h-20 w-20 text-yellow-800 bg-yellow-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-3">知识检索系统拼装中</h2>
      <p class="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
        我们正在构建基于分类目录和关键词全文检索的规划学术成果知识管理库，用于沉淀精细化计算、流域治理与城市低影响开发（LID）的实践图集。敬请期待！
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