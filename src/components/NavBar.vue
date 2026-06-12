<!-- 保存路径: src/components/NavBar.vue -->
<template>
  <nav class="bg-[#1e3a5f] text-white shadow-lg relative z-50">
    <!-- 主导航栏容器 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- 左侧：Logo及网站标题 -->
        <div class="flex-shrink-0 flex items-center space-x-3 cursor-pointer" @click="goToHome">
          <!-- 规划城建风格的 SVG 图标 -->
          <svg class="h-8 w-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="text-lg font-bold tracking-wider font-sans">
            城市规划研究平台
          </span>
        </div>

        <!-- 中间：电脑端导航链接（自适应隐藏） -->
        <div class="hidden md:flex space-x-1 lg:space-x-4">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            class="px-3 py-2 rounded-md text-sm font-medium hover:text-yellow-400 hover:bg-blue-900 transition-all duration-200"
            active-class="text-yellow-400 bg-blue-950 font-semibold border-b-2 border-yellow-400 rounded-b-none"
          >
            {{ link.name }}
          </router-link>
        </div>

        <!-- 右侧：电脑端用户信息及登录按钮 -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- 未登录状态 -->
          <div v-if="!isLoggedIn" class="flex items-center space-x-3">
            <router-link 
              to="/login" 
              class="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded hover:bg-white hover:text-blue-900 transition-all duration-200"
            >
              登录
            </router-link>
            <router-link 
              to="/register" 
              class="px-4 py-1.5 text-sm font-medium bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 transition-all duration-200 font-semibold"
            >
              注册
            </router-link>
          </div>
          
          <!-- 已登录状态 -->
          <div v-else class="flex items-center space-x-3">
            <span class="text-sm text-gray-300 bg-blue-900 px-3 py-1 rounded-full">
              👤 {{ userEmailTruncated }}
            </span>
            <button 
              @click="handleLogout" 
              class="px-4 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200"
            >
              退出
            </button>
          </div>
        </div>

        <!-- 移动端：汉堡菜单按钮 -->
        <div class="flex md:hidden">
          <button 
            @click="toggleMobileMenu" 
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-900 focus:outline-none"
            aria-controls="mobile-menu" 
            :aria-expanded="isMobileMenuOpen"
          >
            <span class="sr-only">打开菜单</span>
            <!-- 汉堡三道杠图标 -->
            <svg 
              v-if="!isMobileMenuOpen" 
              class="block h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!-- 关闭X图标 -->
            <svg 
              v-else 
              class="block h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>

    <!-- 移动端：展开折叠菜单面板 -->
    <div v-show="isMobileMenuOpen" class="md:hidden bg-blue-950 border-t border-blue-900" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          @click="closeMobileMenu"
          class="block px-3 py-2 rounded-md text-base font-medium hover:text-yellow-400 hover:bg-blue-900 transition-colors"
          active-class="text-yellow-400 bg-blue-900 font-semibold"
        >
          {{ link.name }}
        </router-link>
      </div>
      
      <!-- 移动端：底部用户信息/登录控制区 -->
      <div class="pt-4 pb-3 border-t border-blue-900 px-4">
        <div v-if="!isLoggedIn" class="flex flex-col space-y-2">
          <router-link 
            to="/login" 
            @click="closeMobileMenu"
            class="w-full text-center py-2 text-sm font-medium border border-gray-300 rounded hover:bg-white hover:text-blue-900"
          >
            登录
          </router-link>
          <router-link 
            to="/register" 
            @click="closeMobileMenu"
            class="w-full text-center py-2 text-sm font-medium bg-yellow-500 text-gray-900 rounded hover:bg-yellow-400 font-semibold"
          >
            注册
          </router-link>
        </div>
        <div v-else class="flex items-center justify-between">
          <span class="text-sm text-gray-300">
            👤 {{ userEmailTruncated }}
          </span>
          <button 
            @click="handleLogoutAndClose" 
            class="px-4 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded"
          >
            退出
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isMobileMenuOpen = ref(false)

const navLinks = [
  { name: '首页', path: '/' },
  { name: '规划工具与表格', path: '/tools' },
  { name: '政策分析', path: '/policy' },
  { name: '资料库', path: '/library' },
  { name: '知识库', path: '/knowledge' }
]

const isLoggedIn = computed(() => userStore.isLoggedIn)
const userEmail = computed(() => userStore.user?.email || '')
const userEmailTruncated = computed(() => {
  const value = userEmail.value
  return value.length > 15 ? `${value.slice(0, 15)}...` : value
})

const handleLogout = () => {
  userStore.logout()
}

const handleLogoutAndClose = () => {
  userStore.logout()
  closeMobileMenu()
}

watch(
  () => route.path,
  () => {
    closeMobileMenu()
  }
)

onMounted(() => {
  userStore.checkAuth()
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const goToHome = () => {
  router.push('/')
  closeMobileMenu()
}
</script>

<style scoped>
/* 使用 scoped 确保样式不会污染其他部分 */
</style>