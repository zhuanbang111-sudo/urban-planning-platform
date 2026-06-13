// 保存路径: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import ToolsView from '../views/ToolsView.vue'
import Policy from '../views/Policy.vue'
import Library from '../views/Library.vue'
import Knowledge from '../views/Knowledge.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

// 定义路由表
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页 - 城市规划研究平台',
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsView,
    meta: {
      title: '规划工具库 - 城市规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/policy',
    name: 'Policy',
    component: Policy,
    meta: {
      title: '政策文件分析 - 城市规划研究平台',
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/library',
    name: 'Library',
    component: Library,
    meta: {
      title: '标准规范资料库 - 城市规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge,
    meta: {
      title: '规划知识库 - 城市规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '用户登录 - 城市规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '用户注册 - 城市规划研究平台',
      requiresAuth: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：控制访问权限与修改浏览器标签标题
router.beforeEach((to, from, next) => {
  // 1. 动态修改浏览器标签页的标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '城市规划研究平台'
  }

  // 2. 检查该页面是否需要登录权限
  if (to.meta.requiresAuth) {
    // 从 localStorage 中获取登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn')

    if (isLoggedIn === 'true') {
      // 已登录，放行
      next()
    } else {
      // 未登录，弹出提示并拦截
      alert('提示：该板块需要登录后才能访问，请先登录。')
      
      // 重定向到登录页，并记录原本想去的页面地址，方便登录成功后直接跳转回来
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // 不需要登录权限的页面，直接放行
    next()
  }
})

export default router