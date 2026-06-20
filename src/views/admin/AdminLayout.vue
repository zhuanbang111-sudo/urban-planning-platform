<!-- 保存路径: src/views/admin/AdminLayout.vue -->
<template>
  <div class="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-16rem)]">
    
    <!-- 左侧固定窄边栏菜单 (宽220px) -->
    <aside class="w-full md:w-56 flex-shrink-0">
      <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-1">
        <div class="px-4 py-2 border-b border-gray-100 mb-2">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">系统管理控制</span>
        </div>
        
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-gray-50 transition-all duration-150"
          :active-class="item.exact ? '' : 'text-blue-900 bg-blue-50/50 font-bold border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl'"
          :exact-active-class="item.exact ? 'text-blue-900 bg-blue-50/50 font-bold border-l-4 border-blue-900 pl-3 rounded-l-none rounded-r-xl' : ''"
        >
          <span class="text-base">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>
      </div>
    </aside>

    <!-- 右侧子页面内容渲染区域 -->
    <div class="flex-grow min-w-0">
      <router-view />
    </div>

  </div>
</template>

<script setup>
// 后台菜单结构（7个菜单项）
const menuItems = [
  { name: '数据统计仪表盘', path: '/admin', icon: '📊', exact: true }, // exact 精准控制，避免前缀重叠高亮
  { name: '注册审核', path: '/admin/applications', icon: '📋', exact: false },
  { name: '邀请码管理', path: '/admin/invite-codes', icon: '🎫', exact: false },
  { name: '工具管理', path: '/admin/tools', icon: '🔧', exact: false },
  { name: '用户管理', path: '/admin/users', icon: '👥', exact: false },
  { name: '通知公告', path: '/admin/notices', icon: '📢', exact: false },
  { name: '系统设置', path: '/admin/settings', icon: '⚙', exact: false }
]
</script>

<style scoped>
</style>