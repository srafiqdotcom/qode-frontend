<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[`toast-${toast.type}`, { 'toast-dismissible': toast.dismissible }]"
        @click="toast.dismissible && removeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <i :class="getToastIcon(toast.type)"></i>
          </div>
          
          <div class="toast-body">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          
          <button
            v-if="toast.dismissible"
            class="toast-close"
            @click.stop="removeToast(toast.id)"
            aria-label="Close"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div
          v-if="toast.duration > 0"
          class="toast-progress"
          :style="{ animationDuration: toast.duration + 'ms' }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// State
const toasts = ref([])
let toastId = 0

// Methods
const addToast = (options) => {
  const toast = {
    id: ++toastId,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration !== undefined ? options.duration : 5000,
    dismissible: options.dismissible !== false,
    ...options
  }
  
  toasts.value.push(toast)
  
  // Auto remove after duration
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration)
  }
  
  return toast.id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const clearAllToasts = () => {
  toasts.value = []
}

const getToastIcon = (type) => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-triangle-fill',
    warning: 'bi bi-exclamation-circle-fill',
    info: 'bi bi-info-circle-fill',
    loading: 'bi bi-arrow-clockwise'
  }
  return icons[type] || icons.info
}

// Convenience methods
const showSuccess = (message, options = {}) => {
  return addToast({ type: 'success', message, ...options })
}

const showError = (message, options = {}) => {
  return addToast({ type: 'error', message, duration: 8000, ...options })
}

const showWarning = (message, options = {}) => {
  return addToast({ type: 'warning', message, duration: 6000, ...options })
}

const showInfo = (message, options = {}) => {
  return addToast({ type: 'info', message, ...options })
}

const showLoading = (message, options = {}) => {
  return addToast({ type: 'loading', message, duration: 0, dismissible: false, ...options })
}

// Global toast instance
let globalToastInstance = null

onMounted(() => {
  globalToastInstance = {
    add: addToast,
    remove: removeToast,
    clear: clearAllToasts,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading
  }
  
  // Make it globally available
  window.$toast = globalToastInstance
})

onUnmounted(() => {
  if (window.$toast === globalToastInstance) {
    window.$toast = null
  }
})

// Expose methods
defineExpose({
  add: addToast,
  remove: removeToast,
  clear: clearAllToasts,
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1060;
  max-width: 400px;
  width: 100%;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast-item {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #dee2e6;
  overflow: hidden;
  position: relative;
  min-height: 60px;
  cursor: default;
}

.toast-item.toast-dismissible {
  cursor: pointer;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
}

.toast-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.toast-body {
  flex-grow: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: #495057;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #6c757d;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #495057;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  animation: toastProgress linear;
  transform-origin: left;
}

@keyframes toastProgress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Toast type styles */
.toast-success {
  border-left: 4px solid #198754;
}

.toast-success .toast-icon {
  color: #198754;
}

.toast-success .toast-progress {
  background-color: #198754;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-error .toast-icon {
  color: #dc3545;
}

.toast-error .toast-progress {
  background-color: #dc3545;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-warning .toast-icon {
  color: #ffc107;
}

.toast-warning .toast-progress {
  background-color: #ffc107;
}

.toast-info {
  border-left: 4px solid #0dcaf0;
}

.toast-info .toast-icon {
  color: #0dcaf0;
}

.toast-info .toast-progress {
  background-color: #0dcaf0;
}

.toast-loading {
  border-left: 4px solid #6c757d;
}

.toast-loading .toast-icon {
  color: #6c757d;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
  
  .toast-content {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .toast-icon {
    font-size: 1.1rem;
  }
  
  .toast-title {
    font-size: 0.85rem;
  }
  
  .toast-message {
    font-size: 0.8rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast-item {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .toast-title {
    color: #e2e8f0;
  }
  
  .toast-message {
    color: #a0aec0;
  }
  
  .toast-close {
    color: #a0aec0;
  }
  
  .toast-close:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .toast-item {
    border-width: 2px;
  }
  
  .toast-success {
    border-left-width: 6px;
  }
  
  .toast-error {
    border-left-width: 6px;
  }
  
  .toast-warning {
    border-left-width: 6px;
  }
  
  .toast-info {
    border-left-width: 6px;
  }
  
  .toast-loading {
    border-left-width: 6px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
  
  .toast-loading .toast-icon {
    animation: none;
  }
  
  .toast-progress {
    animation: none;
  }
}
</style>
