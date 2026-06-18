// 保存路径: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user' // 引入 Pinia 状态管理获取角色校验

// 导入页面组件
import Home from '../views/Home.vue'
import ToolsView from '../views/Tools.vue' // 统一指向已建立好的 Tools.vue
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
      requiresAuth: false
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
  },
  
  // ==========================================
  // 【安全隔离：管理后台路由及其子版块】
  // ==========================================
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
        meta: { title: '数据统计 - 管理后台' }
      },
      // 1. 注册申请审核管理子路由
      {
        path: 'applications',
        name: 'AdminApplications',
        component: () => import('../views/admin/AdminApplications.vue'),
        meta: { title: '注册审核 - 管理后台' }
      },
      // 2. 邀请码核发控制子路由
      {
        path: 'invite-codes',
        name: 'AdminInviteCodes',
        component: () => import('../views/admin/AdminInviteCodes.vue'),
        meta: { title: '邀请码管理 - 管理后台' }
      },
      {
        path: 'tools',
        name: 'AdminTools',
        component: () => import('../views/admin/AdminTools.vue'),
        meta: { title: '工具管理 - 管理后台' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers.vue'),
        meta: { title: '用户管理 - 管理后台' }
      },
      {
        path: 'notices',
        name: 'AdminNotices',
        component: () => import('../views/admin/AdminNotices.vue'),
        meta: { title: '通知公告 - 管理后台' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/AdminSettings.vue'),
        meta: { title: '系统设置 - 管理后台' }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫：控制访问权限与修改浏览器标签标题
router.beforeEach(async (to, from, next) => {
  // 1. 动态修改浏览器标签页的标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '城市规划研究平台'
  }

  // 2. 针对以 /admin 开头的后台管理路由进行高级鉴权
  if (to.path.startsWith('/admin')) {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('未授权：请先登录管理员账号')
      return next('/login')
    }
    const userStore = useUserStore()
    if (!userStore.user) {
      await userStore.checkAuth()
    }
    // 强制验证当前登录用户的 role 必须是 admin
    if (userStore.user?.role !== 'admin') {
      alert('安全防范：您的账户无权阅览管理后台系统。')
      return next('/')
    }
    return next()
  }

  // 3. 检查前台普通页面是否需要登录权限
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