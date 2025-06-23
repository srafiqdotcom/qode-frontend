import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/blog/:id',
      name: 'blog-detail',
      component: () => import('../views/BlogDetailView.vue'),
    },

    {
      path: '/blog/create',
      name: 'create-blog',
      component: () => import('../views/CreateBlogView.vue'),
      meta: { requiresAuth: true, requiresAuthor: true }
    },
    {
      path: '/blog/edit/:id',
      name: 'edit-blog',
      component: () => import('../views/EditBlogView.vue'),
      meta: { requiresAuth: true, requiresAuthor: true }
    },

    {
      path: '/manage/tags',
      name: 'tag-management',
      component: () => import('../views/TagManagementView.vue'),
      meta: { requiresAuth: true, requiresAuthor: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAuthor: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth store if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // Check if auth is still valid
  if (authStore.isAuthenticated && !authStore.checkAuthStatus()) {
    // Auth expired, clear and redirect
    authStore.clearAuth()
  }

  // Check authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route requires authentication, redirecting to home')
    next({
      path: '/',
      query: {
        redirect: to.fullPath,
        message: 'Please login to access this page'
      }
    })
    return
  }

  // Check author role requirements
  if (to.meta.requiresAuthor && !authStore.isAuthor) {
    console.log('Route requires author role, access denied')
    next({
      path: '/',
      query: {
        message: 'Access denied. Author privileges required.'
      }
    })
    return
  }

  // Update last activity for authenticated users
  if (authStore.isAuthenticated) {
    authStore.updateLastActivity()
  }

  next()
})

export default router
