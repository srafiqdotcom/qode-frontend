<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-display">
      <!-- Critical Error -->
      <div v-if="errorType === 'critical'" class="error-critical">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div class="error-content">
          <h3 class="error-title">Something went wrong</h3>
          <p class="error-message">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="handleRefresh">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refresh Page
            </button>
            <button class="btn btn-outline-secondary" @click="handleRetry">
              <i class="bi bi-arrow-repeat me-1"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Network Error -->
      <div v-else-if="errorType === 'network'" class="error-network">
        <div class="error-icon">
          <i class="bi bi-wifi-off"></i>
        </div>
        <div class="error-content">
          <h4 class="error-title">Connection Problem</h4>
          <p class="error-message">
            {{ error.message || 'Unable to connect to the server. Please check your internet connection.' }}
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="handleRetry">
              <i class="bi bi-arrow-repeat me-1"></i>
              Retry
            </button>
            <button class="btn btn-outline-secondary" @click="checkConnection">
              <i class="bi bi-wifi me-1"></i>
              Check Connection
            </button>
          </div>
        </div>
      </div>

      <!-- Not Found Error -->
      <div v-else-if="errorType === 'notfound'" class="error-notfound">
        <div class="error-icon">
          <i class="bi bi-search"></i>
        </div>
        <div class="error-content">
          <h4 class="error-title">Not Found</h4>
          <p class="error-message">
            {{ error.message || 'The requested resource could not be found.' }}
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="handleGoHome">
              <i class="bi bi-house me-1"></i>
              Go Home
            </button>
            <button class="btn btn-outline-secondary" @click="handleGoBack">
              <i class="bi bi-arrow-left me-1"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>

      <!-- Permission Error -->
      <div v-else-if="errorType === 'permission'" class="error-permission">
        <div class="error-icon">
          <i class="bi bi-shield-exclamation"></i>
        </div>
        <div class="error-content">
          <h4 class="error-title">Access Denied</h4>
          <p class="error-message">
            {{ error.message || 'You do not have permission to access this resource.' }}
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="handleLogin">
              <i class="bi bi-person-check me-1"></i>
              Sign In
            </button>
            <button class="btn btn-outline-secondary" @click="handleGoHome">
              <i class="bi bi-house me-1"></i>
              Go Home
            </button>
          </div>
        </div>
      </div>

      <!-- Generic Error -->
      <div v-else class="error-generic">
        <div class="error-icon">
          <i class="bi bi-exclamation-circle"></i>
        </div>
        <div class="error-content">
          <h4 class="error-title">{{ error.title || 'Error' }}</h4>
          <p class="error-message">
            {{ error.message || 'An unexpected error occurred.' }}
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="handleRetry">
              <i class="bi bi-arrow-repeat me-1"></i>
              Try Again
            </button>
            <button v-if="showDetails" class="btn btn-outline-secondary" @click="toggleDetails">
              <i class="bi bi-info-circle me-1"></i>
              {{ showErrorDetails ? 'Hide' : 'Show' }} Details
            </button>
          </div>
          
          <!-- Error Details -->
          <div v-if="showErrorDetails && error.details" class="error-details mt-3">
            <div class="details-header">
              <h6>Error Details</h6>
            </div>
            <div class="details-content">
              <pre><code>{{ error.details }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Development Info -->
      <div v-if="isDevelopment && error.stack" class="error-dev-info mt-4">
        <details>
          <summary class="dev-summary">
            <i class="bi bi-bug me-1"></i>
            Development Information
          </summary>
          <div class="dev-content">
            <h6>Stack Trace:</h6>
            <pre><code>{{ error.stack }}</code></pre>
            <h6 class="mt-3">Error Object:</h6>
            <pre><code>{{ JSON.stringify(error, null, 2) }}</code></pre>
          </div>
        </details>
      </div>
    </div>

    <!-- Normal Content -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  fallback: {
    type: String,
    default: 'generic'
  },
  showDetails: {
    type: Boolean,
    default: false
  },
  onError: {
    type: Function,
    default: null
  },
  onRetry: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['error', 'retry'])

const router = useRouter()

// State
const hasError = ref(false)
const error = ref(null)
const showErrorDetails = ref(false)

// Computed
const isDevelopment = computed(() => {
  return import.meta.env.DEV
})

const errorType = computed(() => {
  if (!error.value) return 'generic'
  
  // Determine error type based on error properties
  if (error.value.status === 404 || error.value.code === 'NOT_FOUND') {
    return 'notfound'
  }
  
  if (error.value.status === 401 || error.value.status === 403 || error.value.code === 'UNAUTHORIZED') {
    return 'permission'
  }
  
  if (error.value.code === 'NETWORK_ERROR' || error.value.message?.includes('network')) {
    return 'network'
  }
  
  if (error.value.critical || error.value.fatal) {
    return 'critical'
  }
  
  return props.fallback
})

// Methods
const handleError = (err, instance, info) => {
  hasError.value = true
  
  // Normalize error object
  error.value = {
    message: err.message || 'Unknown error',
    stack: err.stack,
    code: err.code,
    status: err.status,
    details: err.details || info,
    timestamp: new Date().toISOString(),
    ...err
  }
  
  // Log error in development
  if (isDevelopment.value) {
    console.error('Error caught by ErrorBoundary:', err)
    console.error('Component info:', info)
  }
  
  // Call custom error handler
  if (props.onError) {
    props.onError(error.value)
  }
  
  // Emit error event
  emit('error', error.value)
}

const handleRetry = () => {
  hasError.value = false
  error.value = null
  showErrorDetails.value = false
  
  if (props.onRetry) {
    props.onRetry()
  }
  
  emit('retry')
}

const handleRefresh = () => {
  window.location.reload()
}

const handleGoHome = () => {
  router.push('/')
}

const handleGoBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    handleGoHome()
  }
}

const handleLogin = () => {
  // Emit event for parent to handle login
  emit('login-required')
}

const checkConnection = () => {
  if (navigator.onLine) {
    alert('Your internet connection appears to be working. The server might be temporarily unavailable.')
  } else {
    alert('You appear to be offline. Please check your internet connection.')
  }
}

const toggleDetails = () => {
  showErrorDetails.value = !showErrorDetails.value
}

// Error capture
onErrorCaptured((err, instance, info) => {
  handleError(err, instance, info)
  return false // Prevent error from propagating
})

// Expose methods for manual error handling
defineExpose({
  setError: (err) => handleError(err, null, 'Manual error'),
  clearError: () => {
    hasError.value = false
    error.value = null
    showErrorDetails.value = false
  },
  retry: handleRetry
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  min-height: 200px;
}

.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  min-height: 400px;
}

.error-critical,
.error-network,
.error-notfound,
.error-permission,
.error-generic {
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-critical .error-icon { color: #dc3545; }
.error-network .error-icon { color: #fd7e14; }
.error-notfound .error-icon { color: #6c757d; }
.error-permission .error-icon { color: #ffc107; }
.error-generic .error-icon { color: #0d6efd; }

.error-title {
  color: #495057;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-details {
  text-align: left;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
}

.details-header h6 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.details-content pre {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 0;
}

.error-dev-info {
  text-align: left;
  max-width: 800px;
  width: 100%;
}

.dev-summary {
  cursor: pointer;
  padding: 0.75rem;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.375rem;
  color: #856404;
  font-weight: 500;
}

.dev-summary:hover {
  background-color: #ffeaa7;
}

.dev-content {
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
}

.dev-content h6 {
  color: #495057;
  margin-bottom: 0.5rem;
}

.dev-content pre {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-display {
    padding: 2rem 1rem;
    min-height: 300px;
  }
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .error-actions .btn {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-title {
    color: #e2e8f0;
  }
  
  .error-message {
    color: #a0aec0;
  }
  
  .error-details {
    background-color: #4a5568;
    border-color: #718096;
  }
  
  .details-header h6 {
    color: #e2e8f0;
  }
  
  .details-content pre,
  .dev-content pre {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .dev-summary {
    background-color: #744210;
    border-color: #d69e2e;
    color: #faf089;
  }
  
  .dev-summary:hover {
    background-color: #d69e2e;
  }
  
  .dev-content {
    background-color: #4a5568;
    border-color: #718096;
  }
  
  .dev-content h6 {
    color: #e2e8f0;
  }
}

/* Animation */
.error-display {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
