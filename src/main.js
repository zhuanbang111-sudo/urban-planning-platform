// 保存路径: src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // 引入 Tailwind CSS 样式文件

const app = createApp(App)

app.use(router) // 启用路由组件

app.mount('#app')