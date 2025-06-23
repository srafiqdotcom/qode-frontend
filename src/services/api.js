import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    if (response.config.metadata) {
      const endTime = new Date()
      const duration = endTime - response.config.metadata.startTime
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
    }

    return response
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear auth data
          console.log('401 Unauthorized - clearing auth data')
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          localStorage.removeItem('auth_timestamp')
          localStorage.removeItem('last_activity')

          // Emit a custom event that the auth store can listen to
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'unauthorized' }
          }))

          // Only redirect if not already on home page
          if (window.location.pathname !== '/') {
            console.log('Redirecting to home page due to 401')
            window.location.href = '/'
          }
          break

        case 403:
          console.error('Access forbidden:', data)
          break

        case 404:
          console.error('Resource not found:', error.config?.url)
          break

        case 422:
          console.error('Validation error:', data)
          break

        case 429:
          console.error('Rate limit exceeded')
          break

        case 500:
          console.error('Server error:', data)
          break

        default:
          console.error(`HTTP ${status} error:`, data)
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.message)
    } else {
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api
