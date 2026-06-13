<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div v-if="listMode" class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-8">
        <nav class="text-sm text-slate-500 mb-3 flex flex-wrap items-center gap-2">
          <router-link to="/" class="hover:text-slate-900">首页</router-link>
          <span>›</span>
          <span class="font-medium text-slate-800">规划工具库</span>
        </nav>
        <h1 class="text-3xl font-bold text-slate-950">规划工具库</h1>
        <p class="mt-2 text-base text-slate-600 max-w-3xl">
          专业市政规划计算工具，登录后使用完整功能。
        </p>
      </div>

      <section class="mb-8">
        <div class="overflow-x-auto">
          <div class="inline-flex rounded-full bg-slate-100 p-1">
            <button
              v-for="category in categories"
              :key="category"
              @click="handleCategoryClick(category)"
              :class="[
                activeCategory === category
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white',
                'rounded-full px-4 py-2 text-sm font-medium transition'
              ]"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div class="mb-4 flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900">工具列表</h2>
          <div class="text-sm text-slate-500">
            共 {{ tools.length }} 个工具
          </div>
        </div>

        <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
          <p class="mt-4 text-slate-600">正在加载工具列表...</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="tool in tools"
            :key="tool.id"
            @click="handleToolClick(tool)"
            class="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  {{ tool.icon || '🧩' }}
                </div>
                <div>
                  <div class="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {{ tool.category || '工具库' }}
                  </div>
                </div>
              </div>
              <span
                :class="tool.status === 'active'
                  ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900'
                  : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600'"
              >
                {{ tool.status === 'active' ? '已上线' : '即将上线' }}
              </span>
            </div>

            <h3 class="mt-6 text-xl font-semibold text-slate-900">{{ tool.name }}</h3>
            <p class="mt-4 text-sm leading-6 text-slate-600" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              {{ tool.description || '暂无工具描述' }}
            </p>

            <div class="mt-6 flex items-center justify-between text-sm text-slate-500">
              <span>权限：{{ tool.min_level === 0 ? '公开' : '登录' }}</span>
              <span class="font-medium">点击查看</span>
            </div>
          </div>
        </div>

        <div v-if="!loading && tools.length === 0" class="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          当前分类暂无可用工具。
        </div>
      </section>
    </div>

    <div v-else class="min-h-screen bg-slate-50">
      <div class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            @click="goBack"
            class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            ← 返回工具列表
          </button>

          <div class="min-w-0 flex-1 text-center">
            <p class="text-sm uppercase tracking-[0.18em] text-slate-500">当前工具</p>
            <h2 class="mt-1 truncate text-xl font-semibold text-slate-950">{{ currentTool?.name || '工具加载中' }}</h2>
          </div>

          <div class="flex items-center gap-3">
            <button
              v-if="currentTool?.tool_type === 'iframe_external'"
              @click="openInNewWindow"
              class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              在新窗口打开
            </button>
          </div>
        </div>
      </div>

      <div class="mx-auto max-w-full px-0 py-4 sm:px-2 lg:px-4">
        <div class="relative mx-auto max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
             style="height: calc(100vh - 140px);">
          <div v-if="iframeLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-white/80">
            <div class="inline-flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          </div>

          <iframe
            v-if="activeToolUrl"
            :src="activeToolUrl"
            frameborder="0"
            class="h-full w-full border-0"
            @load="onIframeLoad"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          ></iframe>

          <div v-if="!activeToolUrl" class="flex h-full items-center justify-center p-8 text-slate-600">
            工具地址无效，请返回工具列表重试。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getTools, accessTool } from '@/utils/api'

const router = useRouter()
const userStore = useUserStore()
userStore.checkAuth()

const categories = ['全部', '排水工程', '消防工程', '道路工程', '更多']
const activeCategory = ref('全部')
const listMode = ref(true)
const tools = ref([])
const loading = ref(false)
const currentTool = ref(null)
const activeToolUrl = ref('')
const iframeLoading = ref(true)

const isLoggedIn = computed(() => userStore.isLoggedIn)

const fetchTools = async () => {
  loading.value = true
  try {
    const category = activeCategory.value === '全部' ? undefined : activeCategory.value
    const response = await getTools(category)
    tools.value = response.tools || []
  } catch (error) {
    tools.value = []
    alert('工具列表加载失败，请刷新页面重试。')
  } finally {
    loading.value = false
  }
}

const handleCategoryClick = (category) => {
  if (activeCategory.value === category) return
  activeCategory.value = category
  fetchTools()
}

const handleToolClick = async (tool) => {
  if (!tool) return

  if (tool.status !== 'active') {
    alert('该工具即将上线')
    return
  }

  if (!isLoggedIn.value && Number(tool.min_level) > 0) {
    const goLogin = window.confirm('请登录后使用此工具。是否前往登录？')
    if (goLogin) {
      router.push('/login')
    }
    return
  }

  try {
    const res = await accessTool(tool.id)
    if (res?.success) {
      currentTool.value = {
        id: tool.id,
        name: tool.name,
        tool_type: res.tool_type,
        url: res.url
      }
      activeToolUrl.value = res.url
      iframeLoading.value = true
      listMode.value = false
    } else {
      alert('工具访问失败，请稍后重试。')
    }
  } catch (error) {
    const status = error?.response?.status
    if (status === 403) {
      alert('权限不足，请联系管理员')
    } else {
      alert('访问异常，请检查登录状态或联系管理员。')
    }
  }
}

const goBack = () => {
  listMode.value = true
  currentTool.value = null
  activeToolUrl.value = ''
}

const openInNewWindow = () => {
  if (currentTool.value?.url) {
    window.open(currentTool.value.url, '_blank', 'noopener')
  }
}

const onIframeLoad = () => {
  iframeLoading.value = false
}

onMounted(fetchTools)
</script>
