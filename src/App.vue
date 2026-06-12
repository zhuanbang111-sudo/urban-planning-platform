<!-- 保存路径: src/App.vue -->
<template>
  <!-- min-h-screen（最小高度撑满屏幕） + flex flex-col（纵向弹性盒模型布局） -->
  <div class="min-h-screen flex flex-col bg-gray-50">
    
    <!-- 1. 顶部导航栏组件 -->
    <NavBar />

    <!-- 2. 中间页面主内容区：flex-grow 会自动拉伸撑开剩余空间，从而将页脚推至屏幕最底部 -->
    <main class="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <!-- 页面切换时的过渡效果容器 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 3. 底部页脚组件 -->
    <FooterBar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.checkAuth()
})
</script>

<style>
/* 页面切换的渐变过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 优化主内容区卡片阴影效果 */
main {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>