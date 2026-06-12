// 保存路径: src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia' // 引入 Pinia 创建函数
import App from './App.vue'
import router from './router'
import './style.css' // 引入 Tailwind CSS 样式文件

const app = createApp(App)
const pinia = createPinia() // 实例化 Pinia

app.use(pinia)  // 全局注入 Pinia 状态管理
app.use(router) // 启用路由组件

app.mount('#app')