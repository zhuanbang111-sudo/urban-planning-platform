<!-- 保存路径: src/views/admin/AdminLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-100 text-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8">
    
    <!-- 左侧固定侧边栏 (宽 220px, 深蓝色背景) -->
    <aside class="w-56 bg-[#1e3a5f] text-white flex flex-col justify-between flex-shrink-0 shadow-xl relative z-20 min-h-screen">
      <div>
        <div class="h-16 flex items-center px-6 border-b border-blue-900 bg-blue-950 shadow-sm">
          <span class="text-md font-black tracking-wider flex items-center space-x-2 text-yellow-400">
            <span>⚙</span>
            <span>管理后台</span>
          </span>
        </div>

        <!-- 垂直导航链接 -->
        <nav class="mt-6 px-3 space-y-1">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-blue-900 hover:text-white"
            :exact="item.exact"
            active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none rounded-r-xl"
            exact-active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none rounded-r-xl"
          >
            <div class="flex items-center space-x-3">
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </div>
          </router-link>
        </nav>
      </div>

      <!-- 底部安全退出前台 -->
      <div class="p-4 border-t border-blue-900">
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
const menuItems = [
  { name: '数据统计仪表盘', path: '/admin', icon: '📊', exact: true },
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