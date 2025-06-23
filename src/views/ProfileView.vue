<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-md-8 mx-auto">
        <h1 class="mb-4">Profile</h1>
        
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h5>User Information</h5>
                <p><strong>Name:</strong> {{ authStore.user?.name }}</p>
                <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
                <p><strong>Role:</strong> 
                  <span class="badge" :class="authStore.isAuthor ? 'bg-primary' : 'bg-secondary'">
                    {{ authStore.user?.role }}
                  </span>
                </p>
              </div>
              <div class="col-md-6">
                <h5>Account Actions</h5>
                <button class="btn btn-outline-danger" @click="handleLogout">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
