<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container">
      <RouterLink to="/" class="navbar-brand">
        <strong>Blog</strong>
      </RouterLink>

      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link">Home</RouterLink>
          </li>

          <li v-if="authStore.isAuthor" class="nav-item">
            <RouterLink to="/blog/create" class="nav-link">
              <i class="bi bi-plus-circle me-1"></i>
              Write
            </RouterLink>
          </li>
          <li v-if="authStore.isAuthor" class="nav-item">
            <RouterLink to="/manage/tags" class="nav-link">
              <i class="bi bi-tags me-1"></i>
              Tags
            </RouterLink>
          </li>
        </ul>



        <ul class="navbar-nav">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item" v-if="authStore.isAuthor">
              <RouterLink to="/dashboard" class="nav-link">
                <i class="bi bi-speedometer2 me-1"></i>Dashboard
              </RouterLink>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="d-flex align-items-center">
                  <div class="bg-light rounded-circle d-flex align-items-center justify-content-center me-2"
                       style="width: 32px; height: 32px;">
                    <i class="bi bi-person-fill text-primary"></i>
                  </div>
                  <span class="d-none d-md-inline">{{ authStore.userName }}</span>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <div class="dropdown-header">
                    <div class="fw-bold">{{ authStore.userName }}</div>
                    <small class="text-muted">{{ authStore.userEmail }}</small>
                    <small class="badge bg-secondary">{{ authStore.user?.role }}</small>
                  </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><RouterLink to="/profile" class="dropdown-item">
                  <i class="bi bi-person me-2"></i>Profile
                </RouterLink></li>
                <li v-if="authStore.isAuthor"><RouterLink to="/dashboard" class="dropdown-item">
                  <i class="bi bi-speedometer2 me-2"></i>Dashboard
                </RouterLink></li>
                <li><hr class="dropdown-divider"></li>
                <li><a href="#" @click="handleLogout" class="dropdown-item text-danger">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </a></li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <button
                class="btn btn-outline-light btn-sm"
                @click="openAuthModal"
              >
                <i class="bi bi-box-arrow-in-right me-1"></i>Login
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>

  <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />


</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import AuthModal from './AuthModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showAuthModal = ref(false)

const openAuthModal = () => {
  showAuthModal.value = true
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    // Optionally show a success message
  } catch (error) {
    console.error('Logout error:', error)
  }
}



onMounted(() => {
  // Check for redirect message from router
  if (route.query.message) {
    // You could show a toast notification here
    console.log('Router message:', route.query.message)
  }
})
</script>
