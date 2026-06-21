<!-- 保存路径: src/views/admin/AdminLayout.vue -->
<template>
  <div class="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-16rem)]">
    
    <!-- 左侧固定分组管理菜单栏 (宽 220px) -->
    <aside class="w-full md:w-56 flex-shrink-0">
      <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
        
        <!-- 顶部独立项：数据统计大屏 -->
        <div>
          <router-link 
            to="/admin"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-all duration-150"
            exact-active-class="text-blue-900 bg-blue-50/50 font-black border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl shadow-inner-light"
          >
            <span class="text-base">📊</span>
            <span>数据统计仪表盘</span>
          </router-link>
        </div>

        <!-- 组 1: 空间内容管理 -->
        <div class="space-y-1">
          <div class="px-4 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span class="text-xxs font-black text-gray-400 uppercase tracking-widest">规划内容管理</span>
          </div>
          <router-link 
            v-for="item in contentMenu" 
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-all duration-150"
            active-class="text-blue-900 bg-blue-50/50 font-bold border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- 组 2: 用户与准入控制 -->
        <div class="space-y-1">
          <div class="px-4 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span class="text-xxs font-black text-gray-400 uppercase tracking-widest">用户与准入控制</span>
          </div>
          <router-link 
            v-for="item in userMenu" 
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-all duration-150"
            active-class="text-blue-900 bg-blue-50/50 font-bold border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- 组 3: 系统维护审计 -->
        <div class="space-y-1">
          <div class="px-4 py-1.5 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span class="text-xxs font-black text-gray-400 uppercase tracking-widest">系统安全审计</span>
          </div>
          <router-link 
            v-for="item in systemMenu" 
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-all duration-150"
            active-class="text-blue-900 bg-blue-50/50 font-bold border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </div>

      </div>
    </aside>

    <!-- 右侧子页面内容渲染区域 -->
    <div class="flex-grow min-w-0">
      <router-view />
    </div>

  </div>
</template>

<script setup>
// 内容管理分流组
const contentMenu = [
  { name: '工具管理', path: '/admin/tools', icon: '🔧' },
  { name: '政策库管理', path: '/admin/policy', icon: '📜' },
  { name: '资料库管理', path: '/admin/library', icon: '📚' },
  { name: '知识库管理', path: '/admin/knowledge', icon: '💡' }
]

// 用户及互动控制组
const userMenu = [
  { name: '注册审核', path: '/admin/applications', icon: '📋' },
  { name: '邀请码管理', path: '/admin/invite-codes', icon: '🎫' },
  { name: '用户管理', path: '/admin/users', icon: '👥' },
  { name: 'AI用量监测', path: '/admin/ai-usage', icon: '📈' },
  { name: '通知公告', path: '/admin/notices', icon: '📢' },
  { name: '邮件群发', path: '/admin/mail', icon: '✉️' }
]

// 安全与系统审计组
const systemMenu = [
  { name: '操作日志', path: '/admin/logs', icon: '📝' },
  { name: '数据备份导出', path: '/admin/export', icon: '💾' },
  { name: '系统设置', path: '/admin/settings', icon: '⚙' }
]
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.shadow-inner-light {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}
</style>