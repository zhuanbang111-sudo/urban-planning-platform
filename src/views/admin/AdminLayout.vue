<!-- 保存路径: src/views/admin/AdminLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-100 text-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8">
    
    <!-- 左侧固定侧边栏 (宽 220px, 深蓝色背景, 带高度自适应防溢出滚动条) -->
    <aside class="w-56 bg-[#1e3a5f] text-white flex flex-col justify-between flex-shrink-0 shadow-xl relative z-20 min-h-screen max-h-screen overflow-y-auto pb-4">
      <div>
        <!-- 侧边栏顶部品牌区域 -->
        <div class="h-16 flex items-center px-6 border-b border-blue-900 bg-blue-950 shadow-sm sticky top-0 z-30">
          <span class="text-md font-black tracking-wider flex items-center space-x-2 text-yellow-400">
            <span>⚙</span>
            <span>管理后台</span>
          </span>
        </div>

        <div class="px-3 mt-4 space-y-5">
          <!-- 1. 独立不分组项：数据统计仪表盘 -->
          <div>
            <router-link 
              :to="dashboardItem.path"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-blue-900 hover:text-white"
              :exact="dashboardItem.exact"
              active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none rounded-r-xl"
              exact-active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none rounded-r-xl"
            >
              <span class="text-base">{{ dashboardItem.icon }}</span>
              <span>{{ dashboardItem.name }}</span>
            </router-link>
          </div>

          <!-- 2. 分组渲染项（内容管理 / 用户与互动 / 系统工具） -->
          <div v-for="group in menuGroups" :key="group.title" class="space-y-1">
            <!-- 分组小微标签 -->
            <div class="px-4 pb-1 text-[10px] font-black tracking-widest text-blue-200/60 uppercase">
              {{ group.title }}
            </div>
            
            <router-link 
              v-for="item in group.items" 
              :key="item.path"
              :to="item.path"
              class="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-blue-900 hover:text-white"
              active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none rounded-r-xl"
            >
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 底部安全退出前台 -->
      <div class="p-4 border-t border-blue-900 mt-6 sticky bottom-0 bg-[#1e3a5f] z-30">
        <router-link 
          to="/"
          class="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-400 rounded-lg text-sm text-gray-300 hover:bg-white hover:text-blue-950 font-bold transition-all duration-200"
        >
          <span>← 返回前台</span>
        </router-link>
      </div>
    </aside>

    <!-- 右侧子页面内容渲染区 -->
    <div class="flex-grow p-6 md:p-8 overflow-y-auto max-w-full">
      <router-view />
    </div>

  </div>
</template>

<script setup>
// A. 顶部独立首项（无分组）
const dashboardItem = { name: '数据统计仪表盘', path: '/admin', icon: '📊', exact: true }

// B. 核心三大分类控制菜单
const menuGroups = [
  {
    title: '内容管理',
    items: [
      { name: '工具管理', path: '/admin/tools', icon: '🔧' },
      { name: '政策库管理', path: '/admin/policy', icon: '📜' },
      { name: '资料库管理', path: '/admin/library', icon: '📚' },
      { name: '知识库管理', path: '/admin/knowledge', icon: '💡' }
    ]
  },
  {
    title: '用户与互动',
    items: [
      { name: '注册审核', path: '/admin/applications', icon: '📋' },
      { name: '邀请码管理', path: '/admin/invite-codes', icon: '🎫' },
      { name: '用户管理', path: '/admin/users', icon: '👥' },
      { name: 'AI用量监测', path: '/admin/ai-usage', icon: '📈' },
      { name: '通知公告', path: '/admin/notices', icon: '📢' },
      { name: '建议反馈', path: '/admin/feedback', icon: '💡' },
      { name: '邮件群发', path: '/admin/mail', icon: '✉️' }
    ]
  },
  {
    title: '系统工具',
    items: [
      { name: '操作日志', path: '/admin/logs', icon: '📝' },
      { name: '数据备份导出', path: '/admin/export', icon: '💾' },
      { name: '系统设置', path: '/admin/settings', icon: '⚙' }
    ]
  }
]
</script>

<style scoped>
/* 隐藏侧边栏的滚动条以便视觉美观，但依然保留原生的物理滚动 */
aside {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}
aside::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>