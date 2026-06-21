<!-- 保存路径: src/views/admin/AdminPolicy.vue -->
<template>
  <div class="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 animate-fade-in">
    <div class="flex items-center space-x-2 text-2xl font-black text-gray-800 border-b border-gray-100 pb-3">
      <span>📜</span>
      <h2>政策库管理</h2>
    </div>
    <p class="text-xs text-blue-900 bg-blue-50/50 p-4 rounded-xl leading-relaxed border-l-4 border-blue-900">
      该模块依赖 **Cloudflare R2** 存储桶，待 R2 创建并绑定 Worker 后开发，用于管理政策文件 PDF 的上传、分类与 AI 分析关联。
    </p>
  </div>
</template>

<script setup>
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>