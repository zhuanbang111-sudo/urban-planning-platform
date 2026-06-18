<!-- 保存路径: src/views/admin/AdminInviteCodes.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 头部 -->
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">🎫 邀请码管理</h2>
        <p class="text-xs text-gray-500 mt-1">核发具有特定使用次数与时效的邀请密钥，供内部规划项目组人员快速核销注册。</p>
      </div>
      <button 
        @click="showCreateModal = true" 
        class="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition-all"
      >
        + 核发新邀请码
      </button>
    </div>

    <!-- 数据表 -->
    <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-4 text-left">邀请密钥</th>
            <th class="px-6 py-4 text-left">备注说明</th>
            <th class="px-6 py-4 text-left">核销使用频次</th>
            <th class="px-6 py-4 text-left">有效期</th>
            <th class="px-6 py-4 text-center w-28">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 text-gray-700">
          <tr v-if="list.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-xs text-gray-400">
              暂未生成任何邀请密钥。
            </td>
          </tr>
          <tr v-for="code in list" :key="code.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4 font-mono font-bold text-blue-900 tracking-wider">
              {{ code.code }}
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">
              {{ code.note || '未命名备注' }}
            </td>
            <!-- 频次进度条 -->
            <td class="px-6 py-4">
              <div class="space-y-1 max-w-xs">
                <div class="flex justify-between text-xxs font-semibold">
                  <span>已核销：{{ code.used_count }} / {{ code.max_uses }} 次</span>
                </div>
                <div class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    :style="{ width: (code.used_count / code.max_uses) * 100 + '%' }"
                    class="h-full bg-blue-900 rounded-full transition-all duration-300"
                  ></div>
                </div>
              </div>
            </td>
            <!-- 有效期检测 -->
            <td class="px-6 py-4 text-xs font-semibold">
              <span v-if="!code.expires_at" class="text-green-600 bg-green-50 px-2 py-0.5 rounded">永久有效</span>
              <span v-else-if="isExpired(code.expires_at)" class="text-red-600 bg-red-50 px-2 py-0.5 rounded">已过期</span>
              <span v-else class="text-blue-900 bg-blue-50 px-2 py-0.5 rounded">剩余 {{ getRemainingDays(code.expires_at) }} 天</span>
            </td>
            <td class="px-6 py-4 text-center">
              <button 
                @click="openDeleteConfirm(code)"
                class="text-red-600 hover:text-red-700 text-xs font-bold"
              >
                吊销
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 弹窗 A：生成密钥参数配置弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900">核发新邀请密钥</h3>
        <form @submit.prevent="handleCreateSubmit" class="space-y-4 mt-4">
          <div>
            <label class="block text-xs font-bold text-gray-700">最大核销上限（次数）</label>
            <input 
              v-model="maxUses" 
              type="number" 
              required 
              min="1"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700">时效限制</label>
            <select v-model="expiresDays" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white">
              <option :value="null">永久有效</option>
              <option :value="7">7 天有效期</option>
              <option :value="30">30 天有效期</option>
              <option :value="90">90 天有效期</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700">备注</label>
            <input 
              v-model="note" 
              type="text" 
              placeholder="如：发放给中规院某研究员"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div class="mt-6 flex space-x-3">
            <button @click="showCreateModal = false" type="button" class="flex-1 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500">取消</button>
            <button type="submit" class="flex-1 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold">立即生成</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 弹窗 B：生成成功，大号展示 -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
        <span class="text-4xl">🎉</span>
        <h3 class="text-lg font-bold text-gray-900">邀请密钥生成成功</h3>
        
        <div class="bg-gray-100 border border-gray-200 py-3 px-4 rounded-xl text-xl font-mono font-bold tracking-widest text-blue-900 shadow-inner">
          {{ createdCode }}
        </div>

        <div class="flex space-x-3 pt-2">
          <button 
            @click="copyCode" 
            class="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all shadow"
          >
            {{ hasCopied ? '已复制 ✓' : '一键复制' }}
          </button>
          <button @click="showSuccessModal = false" class="flex-1 py-2.5 border border-gray-300 text-gray-500 rounded-lg text-xs font-bold">关闭</button>
        </div>
      </div>
    </div>

    <!-- 弹窗 C：注销安全防呆确认 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
        <h3 class="text-lg font-bold text-red-600">确认物理吊销该密钥？</h3>
        <p class="text-xs text-gray-500 leading-relaxed">
          吊销邀请密钥 **{{ targetCode?.code }}** 属于物理注销行为。该操作不可撤销，吊销后尚未核销完毕的用户将永久失效！
        </p>
        <div class="flex space-x-3 pt-2">
          <button @click="showDeleteModal = false" class="flex-1 py-2 border border-gray-300 text-gray-500 rounded-lg text-xs font-bold">取消</button>
          <button @click="confirmDelete" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow">确认注销</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getInviteCodes, createInviteCode, deleteInviteCode } from '../../utils/api'

const list = ref([])
const showCreateModal = ref(false)
const showSuccessModal = ref(false)
const showDeleteModal = ref(false)

const maxUses = ref(1)
const expiresDays = ref(null)
const note = ref('')
const createdCode = ref('')
const hasCopied = ref(false)
const targetCode = ref(null)

const fetchList = async () => {
  try {
    const res = await getInviteCodes()
    list.value = res.invite_codes || []
  } catch (err) {
    console.error(err)
  }
}

const handleCreateSubmit = async () => {
  try {
    const res = await createInviteCode({
      max_uses: maxUses.value,
      expires_days: expiresDays.value,
      note: note.value
    })
    if (res.success) {
      createdCode.value = res.code
      showCreateModal.value = false
      showSuccessModal.value = true
      hasCopied.value = false
      await fetchList()
    }
  } catch (err) {
    alert('创建邀请码发生异常')
  }
}

// 复制机制
const copyCode = () => {
  navigator.clipboard.writeText(createdCode.value)
  hasCopied.value = true
}

const openDeleteConfirm = (code) => {
  targetCode.value = code
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!targetCode.value) return
  try {
    const res = await deleteInviteCode(targetCode.value.id)
    if (res.success) {
      showDeleteModal.value = false
      await fetchList()
    }
  } catch (err) {
    alert('注销密钥失败')
  }
}

// 辅助时间比对
const isExpired = (expStr) => {
  if (!expStr) return false
  return new Date(expStr) < new Date()
}

const getRemainingDays = (expStr) => {
  if (!expStr) return 0
  const days = Math.ceil((new Date(expStr) - new Date()) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.text-xxs { font-size: 0.65rem; }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
</style>