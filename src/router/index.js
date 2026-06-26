// 保存路径: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

// 导入前台基础页面组件
import Home from '../views/Home.vue'
import ToolsView from '../views/Tools.vue'
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
      title: '首页 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsView,
    meta: {
      title: '规划工具库 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/policy',
    name: 'Policy',
    component: Policy,
    meta: {
      title: '政策文件分析 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/library',
    name: 'Library',
    component: Library,
    meta: {
      title: '标准规范资料库 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge,
    meta: {
      title: '规划知识库 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '用户登录 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '用户注册 - 城市基础设施规划研究平台',
      requiresAuth: false
    }
  },
  // ==========================================
  // 【后台管理系统路由及子版块】
  // ==========================================
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { 
      requiresAuth: true,
      fullWidth: true // 代表突破 1280px 宽度限制，占满可用屏幕宽度
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
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
        component: () => import('../views/admin/AdminTools.vue'),
        meta: { title: '工具管理 - 管理后台' }
      },
      // 1. 补齐内容：政策库管理子路由（紧跟在 tools 后面）
      {
        path: 'policy',
        name: 'AdminPolicy',
        component: () => import('../views/admin/AdminPolicy.vue'),
        meta: { title: '政策库管理 - 管理后台' }
      },
      // 2. 补齐内容：资料库管理子路由
      {
        path: 'library',
        name: 'AdminLibrary',
        component: () => import('../views/admin/AdminLibrary.vue'),
        meta: { title: '资料库管理 - 管理后台' }
      },
      // 3. 补齐内容：知识库管理子路由
      {
        path: 'knowledge',
        name: 'AdminKnowledge',
        component: () => import('../views/admin/AdminKnowledge.vue'),
        meta: { title: '知识库管理 - 管理后台' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/AdminUsers.vue'),
        meta: { title: '用户管理 - 管理后台' }
      },
      // 4. 补齐内容：AI用量监测子路由（紧跟在 users 后面）
      {
        path: 'ai-usage',
        name: 'AdminAiUsage',
        component: () => import('../views/admin/AdminAiUsage.vue'),
        meta: { title: 'AI用量监测 - 管理后台' }
      },
      {
        path: 'notices',
        name: 'AdminNotices',
        component: () => import('../views/admin/AdminNotices.vue'),
        meta: { title: '通知公告 - 管理后台' }
      },
      // 新增内容：建议反馈子路由
      {
        path: 'feedback',
        name: 'AdminFeedback',
        component: () => import('../views/admin/AdminFeedback.vue'),
        meta: { title: '建议反馈 - 管理后台' }
      },
      // 5. 补齐内容：邮件群发子路由（紧跟在 feedback 后面）
      {
        path: 'mail',
        name: 'AdminMail',
        component: () => import('../views/admin/AdminMail.vue'),
        meta: { title: '邮件群发 - 管理后台' }
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../views/admin/AdminSettings.vue'),
        meta: { title: '系统设置 - 管理后台' }
      },
      // 6. 补齐内容：操作日志子路由（追加在最后）
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../views/admin/AdminLogs.vue'),
        meta: { title: '操作日志 - 管理后台' }
      },
      // 7. 补齐内容：数据备份导出子路由（追加在最后）
      {
        path: 'export',
        name: 'AdminExport',
        component: () => import('../views/admin/AdminExport.vue'),
        meta: { title: '数据备份导出 - 管理后台' }
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
    document.title = '城市基础设施规划研究平台'
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