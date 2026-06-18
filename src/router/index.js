// 保存路径: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue' // 引入渲染函数，完美解决缺失文件编译崩溃问题
import { useUserStore } from '../stores/user'

// 导入前台基础页面组件
import Home from '../views/Home.vue'
import ToolsView from '../views/Tools.vue'
import Policy from '../views/Policy.vue'
import Library from '../views/Library.vue'
import Knowledge from '../views/Knowledge.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

// ==========================================
// 【内置高可靠性占位组件，100% 阻止云端编译崩溃】
// ==========================================
const AdminDashboard = {
  render: () => h('div', { class: 'bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-3' }, [
    h('h2', { class: 'text-2xl font-black text-gray-800 flex items-center space-x-2' }, [
      h('span', '📊'), h('span', '平台数据大屏统计')
    ]),
    h('p', { class: 'text-sm text-gray-500 leading-relaxed' }, '该版块正在集成 Cloudflare D1 用户活跃周期分析，支持查看工具总调用、周活、日活增幅等指标。')
  ])
}

const AdminTools = {
  render: () => h('div', { class: 'bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-3' }, [
    h('h2', { class: 'text-2xl font-black text-gray-800 flex items-center space-x-2' }, [
      h('span', '🔧'), h('span', '规划工具卡片控制台')
    ]),
    h('p', { class: 'text-sm text-gray-500 leading-relaxed' }, '支持在此一键管理、编辑、置顶、上架或下架 tools 表中的市政计算模型及协作表格卡片。')
  ])
}

const AdminUsers = {
  render: () => h('div', { class: 'bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-3' }, [
    h('h2', { class: 'text-2xl font-black text-gray-800 flex items-center space-x-2' }, [
      h('span', '👥'), h('span', '用户管理与权限升级审批')
    ]),
    h('p', { class: 'text-sm text-gray-500 leading-relaxed' }, '支持管理员在此批量过滤注册用户、检索操作存根日志，并手动提升其 user_quota 权限。')
  ])
}

const AdminNotices = {
  render: () => h('div', { class: 'bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-3' }, [
    h('h2', { class: 'text-2xl font-black text-gray-800 flex items-center space-x-2' }, [
      h('span', '📢'), h('span', '平台全局广播通知公告')
    ]),
    h('p', { class: 'text-sm text-gray-500 leading-relaxed' }, '支持管理员在此统一编撰前台顶栏、侧栏全局广播公告、更新规范资料库动态。')
  ])
}

const AdminSettings = {
  render: () => h('div', { class: 'bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-3' }, [
    h('h2', { class: 'text-2xl font-black text-gray-800 flex items-center space-x-2' }, [
      h('span', '⚙'), h('span', '系统核心参数设置')
    ]),
    h('p', { class: 'text-sm text-gray-500 leading-relaxed' }, '支持在此快速微调 JWT 会话周期、重设 D1 连接池最大重连频次及默认注册等级。')
  ])
}

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
      requiresAuth: true
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
  // 【后台管理系统路由及子版块】
  // ==========================================
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard, // 采用上方已自愈声明的组件
        meta: { title: '数据统计 - 管理后台' }
      },
      {
        path: 'applications',
        name: 'AdminApplications',
        component: () => import('../views/admin/AdminApplications.vue'),
        meta: { title: '注册审核 - 管理后台' }
      },
      {
        path: 'invite-codes',
        name: 'AdminInviteCodes',
        component: () => import('../views/admin/AdminInviteCodes.vue'),
        meta: { title: '邀请码管理 - 管理后台' }
      },
      {
        path: 'tools',
        name: 'AdminTools',
        component: AdminTools, // 采用内联防崩
        meta: { title: '工具管理 - 管理后台' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers, // 采用内嵌
        meta: { title: '用户管理 - 管理后台' }
      },
      {
        path: 'notices',
        name: 'AdminNotices',
        component: AdminNotices, // 采用内嵌
        meta: { title: '通知公告 - 管理后台' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: AdminSettings, // 采用内嵌
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

  // 2. 后台管理系统路由深度拦截防御
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
    // 强制校验用户角色必须为 admin
    if (userStore.user?.role !== 'admin') {
      alert('安全警告：您的账户无权访问后台管理系统。')
      return next('/')
    }
    return next()
  }

  // 3. 普通前台页面要求登录的拦截
  if (to.meta.requiresAuth) {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    if (isLoggedIn === 'true') {
      next()
    } else {
      alert('提示：该板块需要登录后才能访问，请先登录。')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router