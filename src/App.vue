<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import Navbar from './components/Navbar.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import ToastContainer from './components/ToastContainer.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const authStore = useAuthStore()

// Global state
const globalLoading = ref(false)
const toastContainer = ref(null)

// Global loading management
const showGlobalLoading = () => {
  globalLoading.value = true
}

const hideGlobalLoading = () => {
  globalLoading.value = false
}

// Global toast methods
const showToast = (options) => {
  if (toastContainer.value) {
    return toastContainer.value.add(options)
  }
}

const showSuccessToast = (message, options = {}) => {
  if (toastContainer.value) {
    return toastContainer.value.success(message, options)
  }
}

const showErrorToast = (message, options = {}) => {
  if (toastContainer.value) {
    return toastContainer.value.error(message, options)
  }
}

const showWarningToast = (message, options = {}) => {
  if (toastContainer.value) {
    return toastContainer.value.warning(message, options)
  }
}

const showInfoToast = (message, options = {}) => {
  if (toastContainer.value) {
    return toastContainer.value.info(message, options)
  }
}

onMounted(() => {
  // Initialize auth store
  authStore.initialize()

  // Make globally available
  window.$loading = {
    show: showGlobalLoading,
    hide: hideGlobalLoading
  }

  window.$toast = {
    show: showToast,
    success: showSuccessToast,
    error: showErrorToast,
    warning: showWarningToast,
    info: showInfoToast
  }
})

onUnmounted(() => {
  window.$loading = null
  window.$toast = null
})
</script>

<template>
    <ErrorBoundary>
      <Navbar />
      <main class="main-content">
        <RouterView />
      </main>

      <!-- Global Components -->
      <ToastContainer ref="toastContainer" />

      <!-- Loading Overlay -->
      <LoadingSpinner
        v-if="globalLoading"
        type="ring"
        size="lg"
        variant="primary"
        text="Loading..."
        :show-text="true"
        :overlay="true"
      />
    </ErrorBoundary>
</template>

<style>
/* Global App Styles */
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.6;
  color: #212529;
}

.main-content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  position: relative;
}

/* Improved scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles for accessibility */
*:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

button:focus,
.btn:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Improved form controls */
.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Animation utilities */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Utility classes */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shadow-hover {
  transition: box-shadow 0.3s ease;
}

.shadow-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.transform-hover {
  transition: transform 0.2s ease;
}

.transform-hover:hover {
  transform: translateY(-2px);
}

/* Responsive improvements */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  #app {
    background-color: #1a202c;
    color: #e2e8f0;
  }

  ::-webkit-scrollbar-track {
    background: #2d3748;
  }

  ::-webkit-scrollbar-thumb {
    background: #4a5568;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #718096;
  }

  *:focus {
    outline-color: #4299e1;
  }

  button:focus,
  .btn:focus {
    outline-color: #4299e1;
    box-shadow: 0 0 0 0.25rem rgba(66, 153, 225, 0.25);
  }

  .form-control:focus,
  .form-select:focus {
    border-color: #4299e1;
    box-shadow: 0 0 0 0.25rem rgba(66, 153, 225, 0.25);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  #app {
    background-color: white;
    color: black;
  }

  .btn {
    border-width: 2px;
  }

  .form-control,
  .form-select {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active,
  .shadow-hover,
  .transform-hover {
    transition: none !important;
  }
}

/* Print styles */
@media print {
  .main-content {
    padding-top: 0;
  }

  .btn,
  .navbar,
  .toast-container {
    display: none !important;
  }

  .container {
    max-width: none !important;
    padding: 0 !important;
  }
}
</style>
