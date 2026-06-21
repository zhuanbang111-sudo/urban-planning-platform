<!-- 保存路径: src/views/admin/AdminExport.vue -->
<template>
  <div class="space-y-6 animate-fade-in bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between border-b border-gray-100 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">💾 平台数据物理级备份导出</h2>
        <p class="text-xs text-gray-500 mt-1">支持管理员一键将系统核心数据表打包转换为标准、带 BOM 字符不乱码的纯文本 CSV 文件，提供物理级备份。</p>
      </div>
    </div>

    <!-- 网格卡片按钮 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      <div 
        v-for="btn in exportButtons" 
        :key="btn.table"
        class="border border-gray-100 rounded-2xl p-6 shadow-inner-light hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div class="space-y-2">
          <span class="text-3xl p-1 bg-gray-50 rounded-lg inline-block">{{ btn.icon }}</span>
          <h3 class="text-base font-bold text-gray-900">{{ btn.name }}</h3>
          <p class="text-xxs text-gray-400 leading-relaxed">{{ btn.desc }}</p>
        </div>

        <button
          @click="triggerExport(btn.table)"
          :disabled="exportingTable === btn.table"
          class="w-full mt-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors duration-150 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ exportingTable === btn.table ? '物理打包中...' : '一键打包下载 ↓' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const exportingTable = ref(null)

const exportButtons = [
  { name: '用户主档数据表', table: 'users', icon: '👥', desc: '包含全部用户邮箱、系统级别、审核状态、创建时间（已安全脱敏物理过滤 password 列）。' },
  { name: '上架工具数据表', table: 'tools', icon: '🔧', desc: '备份 tools 实物数据表，含有全部已上线工具的名称、类别、安全限制及路由。' },
  { name: '计算及使用日志', table: 'tool_history', icon: '📝', desc: '获取用户产生的工具使用与计算存根明细（限云端最近 1000 条）。' },
  { name: '核发邀请密钥表', table: 'invite_codes', icon: '🎫', desc: '导出邀请密钥的占用量、最大核销次数上限、到期日与发放备注信息。' }
]

// 核心导出机制：使用带 Authorization Bearer Token 形式物理下载 blob 数据块并熔断释放
const triggerExport = async (tableName) => {
  exportingTable.value = tableName
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`https://planning-platform-api.zhuanbang111.workers.dev/api/admin/export?table=${tableName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}))
      throw new Error(errRes.error || '云端接口拒绝访问')
    }

    // 接收 blob 二进制并提取文件名
    const blob = await response.blob()
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `${tableName}.csv`
    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition.split('filename=')[1].replace(/"/g, '')
    }

    // 模拟锚点触发
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // 内存熔断回收
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log(`物理备份包 ${filename} 提取完毕。`)
  } catch (err) {
    alert('导出异常：' + err.message)
  } finally {
    exportingTable.value = null
  }
}
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.shadow-inner-light {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.01);
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>