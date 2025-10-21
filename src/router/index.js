import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'

// 只在router文件中安装Vue Router
Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  // 移除或注释掉这个路由
  // { 
  //   path: '/users', 
  //   name: 'UserList', 
  //   component: UserList,
  //   meta: { 
  //     requiresAuth: true,
  //     requiresAdmin: true 
  //   }
  // },
  { path: '*', redirect: '/dashboard' }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫 - 检查用户是否已登录和是否有管理员权限
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    const token = localStorage.getItem('authToken')
    if (!token) {
      // 未登录，重定向到登录页
      next({ path: '/login' })
    } else {
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        try {
          // 从localStorage中获取用户信息
          const userInfo = localStorage.getItem('userInfo')
          if (userInfo) {
            const user = JSON.parse(userInfo)
            // 检查是否为管理员
            if (user.username === 'admin' || user.role === 'admin') {
              // 是管理员，继续访问
              next()
            } else {
              // 不是管理员，提示没有权限
              next({ path: '/dashboard' })
              // 延迟显示提示，确保路由跳转完成
              setTimeout(() => {
                if (Vue.prototype.$message) {
                  Vue.prototype.$message.error('您没有权限访问此页面')
                } else {
                  console.error('您没有权限访问此页面')
                }
              }, 100)
            }
          } else {
            // 没有用户信息，视为非管理员
            next({ path: '/dashboard' })
          }
        } catch (error) {
          console.error('检查用户权限失败:', error)
          next({ path: '/dashboard' })
        }
      } else {
        // 不需要管理员权限，继续访问
        next()
      }
    }
  } else {
    next()
  }
})

export default router