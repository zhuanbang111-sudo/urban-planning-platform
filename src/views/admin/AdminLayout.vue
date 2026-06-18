<!-- 保存路径: src/views/admin/AdminLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-100 text-gray-800">
    
    <!-- 左侧固定侧边栏 (宽 240px, 深蓝色背景) -->
    <aside class="w-60 bg-[#1e3a5f] text-white flex flex-col justify-between flex-shrink-0 shadow-xl relative z-20">
      
      <!-- 顶部标题 -->
      <div>
        <div class="h-16 flex items-center px-6 border-b border-blue-900 bg-blue-950">
          <span class="text-lg font-black tracking-wider flex items-center space-x-2 text-yellow-400">
            <span>⚙</span>
            <span>管理后台</span>
          </span>
        </div>

        <!-- 垂直导航菜单 -->
        <nav class="mt-6 px-3 space-y-1">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-blue-900 hover:text-white"
            :exact="item.exact"
            active-class="text-yellow-400 bg-blue-950 font-bold border-l-4 border-yellow-400 rounded-l-none"
          >
            <div class="flex items-center space-x-3">
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </div>
            
            <!-- 亮点修改：如果是注册审批项，且有积压的待审批数，显示醒目的红色数字角标 -->
            <span 
              v-if="item.badgeKey === 'applications' && pendingCount > 0"
              class="px-2 py-0.5 bg-red-500 text-white text-xxs font-black rounded-full animate-pulse"
            >
              {{ pendingCount }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- 底部安全返回 -->
      <div class="p-4 border-t border-blue-900">
        <router-link 
          to="/"
          class="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-400 rounded-lg text-sm text-gray-300 hover:bg-white hover:text-blue-950 font-bold transition-all duration-200"
        >
          <span>←</span>
          <span>返回前台主站</span>
        </router-link>
      </div>
    </aside>

    <!-- 右侧主内容展示区 -->
    <div class="flex-grow flex flex-col min-h-screen overflow-y-auto">
      
      <!-- 顶部信息头 -->
      <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center px-8 justify-between">
        <!-- 动态面包屑结构 -->
        <div class="flex items-center space-x-2 text-xs text-gray-500">
          <span class="hover:text-blue-900 cursor-pointer">管理后台</span>
          <span>&gt;</span>
          <span class="text-gray-800 font-bold">{{ currentAdminPageTitle }}</span>
        </div>
        
        <!-- 管理员在线标 -->
        <div class="text-xs text-gray-500 flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
          <span class="font-bold">系统管理员在线</span>
        </div>
      </header>

      <!-- 子页面视图 -->
      <main class="flex-grow p-8 max-w-7xl w-full mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="admin-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getApplications } from '../../utils/api' // 获取待审核统计

const route = useRoute()
const pendingCount = ref(0)

// 侧边栏菜单选项（新增两个审批及密钥卡片节点）
const menuItems = [
  { name: '数据统计', path: '/admin', icon: '📊', exact: true },
  { name: '注册审核', path: '/admin/applications', icon: '📋', exact: false, badgeKey: 'applications' },
  { name: '邀请码管理', path: '/admin/invite-codes', icon: '🎫', exact: false },
  { name: '工具管理', path: '/admin/tools', icon: '🔧', exact: false },
  { name: '用户管理', path: '/admin/users', icon: '👥', exact: false },
  { name: '通知公告', path: '/admin/notices', icon: '📢', exact: false },
  { name: '系统设置', path: '/admin/settings', icon: '⚙', exact: false }
]

const currentAdminPageTitle = computed(() => {
  if (route.meta && route.meta.title) {
    return route.meta.title.replace(' - 管理后台', '')
  }
  return '数据统计'
})

// 轮询或加载时，自动核对当前待审批的任务数量
const syncPendingApplications = async () => {
  try {
    const res = await getApplications('pending') // 只获取待审核状态的行数
    pendingCount.value = res.total || 0
  } catch (err) {
    console.error('待审批数获取异常:', err)
  }
}

onMounted(() => {
  syncPendingApplications()
})
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.admin-fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}
.admin-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>