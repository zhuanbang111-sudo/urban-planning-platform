<!-- 保存路径: src/views/admin/AdminSettings.vue -->
<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <!-- 头部栏 -->
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-800">⚙ 全局系统参数设置</h2>
      <p class="text-xs text-gray-500 mt-1">参数热插拔大盘：修改城市规划研究平台的运行控制、注册守卫及维护阈值参数。</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-3"></div>
      <p class="text-xs text-gray-500">正在调取全局配置大盘...</p>
    </div>

    <!-- 系统全局配置表单 -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div class="grid grid-cols-1 gap-6">
        
        <!-- 1. 站点名称 -->
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">系统平台名称 (site_name)</label>
          <input 
            v-model="form.site_name" 
            type="text" 
            required 
            placeholder="请输入站点名称"
            class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs"
          />
        </div>

        <!-- 2. 开放注册 (registration_enabled) Toggle -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-gray-900">开放注册守卫安全开关 (registration_enabled)</h4>
            <p class="text-[11px] text-gray-400">关闭后，注册大通道彻底锁定，新注册用户将瞬间抛出 403 阻断返回。</p>
          </div>
          <button 
            type="button" 
            @click="form.registration_enabled = form.registration_enabled === 'true' ? 'false' : 'true'"
            :class="form.registration_enabled === 'true' ? 'bg-green-700' : 'bg-gray-300'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          >
            <span 
              :class="form.registration_enabled === 'true' ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <!-- 3. 维护模式 (maintenance_mode) Toggle -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-gray-900">系统维护大屏锁定 (maintenance_mode)</h4>
            <p class="text-[11px] text-orange-500 font-medium">当前仅作为状态记录，尚未接入实际维护页面拦截逻辑。</p>
          </div>
          <button 
            type="button" 
            @click="form.maintenance_mode = form.maintenance_mode === 'true' ? 'false' : 'true'"
            :class="form.maintenance_mode === 'true' ? 'bg-orange-600' : 'bg-gray-300'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          >
            <span 
              :class="form.maintenance_mode === 'true' ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <!-- 4. 维护提示文案 -->
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">系统维护广播公告提示 (maintenance_message)</label>
          <input 
            v-model="form.maintenance_message" 
            type="text" 
            placeholder="例如：系统机房扩容升级中，预计将于明天早上8点恢复..."
            class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs"
          />
        </div>

      </div>

      <hr class="border-gray-100" />

      <!-- 保存按钮及精美 Banner 成功反馈 -->
      <div class="flex items-center justify-between pt-2">
        <button 
          @click="saveSettings" 
          :disabled="saving"
          class="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-all focus:outline-none disabled:bg-gray-300"
        >
          {{ saving ? '正在物理打包...' : '保存配置' }}
        </button>

        <!-- 临时提示反馈 3秒淡出 -->
        <transition name="toast-fade">
          <div 
            v-if="showSuccessToast" 
            class="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold shadow-inner"
          >
            🎉 系统参数批量 UPSERT 写入成功，全局热更新生效！
          </div>
        </transition>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const saving = ref(false)
const showSuccessToast = ref(false)

const form = ref({
  site_name: '',
  registration_enabled: 'true',
  maintenance_mode: 'false',
  maintenance_message: ''
})

const getAdminHeaders = () => {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await axios.get('https://api.urbancopilot.qzz.io/api/admin/settings', getAdminHeaders())
    const settings = res.data.settings || {}
    form.value = {
      site_name: settings.site_name || '',
      registration_enabled: settings.registration_enabled !== undefined ? String(settings.registration_enabled) : 'true',
      maintenance_mode: settings.maintenance_mode !== undefined ? String(settings.maintenance_mode) : 'false',
      maintenance_message: settings.maintenance_message || ''
    }
  } catch (err) {
    console.error('系统设置获取失败：', err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const payload = {
      site_name: form.value.site_name.trim(),
      registration_enabled: String(form.value.registration_enabled),
      maintenance_mode: String(form.value.maintenance_mode),
      maintenance_message: form.value.maintenance_message.trim()
    }
    
    await axios.put('https://api.urbancopilot.qzz.io/api/admin/settings', payload, getAdminHeaders())
    
    // 开启动态 Banner 停留 3 秒消失
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
    
  } catch (err) {
    alert('参数保存发生异常')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

/* Toast 渐入渐出动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>