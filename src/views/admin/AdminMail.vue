<!-- 保存路径: src/views/admin/AdminMail.vue -->
<template>
  <div class="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 animate-fade-in">
    <div class="flex items-center space-x-2 text-2xl font-black text-gray-800 border-b border-gray-100 pb-3">
      <span>✉️</span>
      <h2>邮件群发控制台</h2>
    </div>
    <p class="text-xs text-blue-900 bg-blue-50/50 p-4 rounded-xl leading-relaxed border-l-4 border-blue-900">
      该模块依赖第三方高阶邮件发送服务（如 Resend / SendGrid），当前尚未在云端 Worker 选定并灌入服务商的 API 密钥，待环境变量配置完成后开发。
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