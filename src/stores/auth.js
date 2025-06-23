import { defineStore } from 'pinia'
import { authService } from '../services/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
    lastActivity: null
  }),

  getters: {
    isAuthor: (state) => state.user?.role === 'author',
    isReader: (state) => state.user?.role === 'reader',
    userName: (state) => state.user?.name || 'User',
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    async initialize() {
      if (this.isInitialized) return

      try {
        const token = authService.getToken()
        const user = authService.getCurrentUser()

        console.log('Auth initialization:', { token: !!token, user: !!user })

        if (token && user) {
          this.token = token
          this.user = user
          this.isAuthenticated = true
          this.updateLastActivity()
          console.log('Auth initialized successfully:', this.user.name)
        } else {
          console.log('No valid auth data found')
        }

        // Listen for auth logout events from API interceptor
        window.addEventListener('auth:logout', () => {
          console.log('Received auth:logout event')
          this.clearAuth()
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        this.clearAuth()
      } finally {
        this.isInitialized = true
      }
    },

    updateLastActivity() {
      this.lastActivity = Date.now()
      localStorage.setItem('last_activity', this.lastActivity.toString())
    },

    clearAuth() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.error = null
      authService.clearStorage()
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.register(userData)
        return response
      } catch (error) {
        const errorMessage = this.extractErrorMessage(error, 'Registration failed')
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    async requestOtp(email) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.requestOtp(email)
        return response
      } catch (error) {
        const errorMessage = this.extractErrorMessage(error, 'Failed to send OTP')
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    async verifyOtp(email, otpCode) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.verifyOtp(email, otpCode)

        if (response.data.token && response.data.user) {
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true
          this.updateLastActivity()
        } else {
          throw new Error('Invalid response from server')
        }

        return response
      } catch (error) {
        const errorMessage = this.extractErrorMessage(error, 'Invalid OTP code')
        this.error = errorMessage
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true

      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
        this.loading = false
      }
    },

    extractErrorMessage(error, defaultMessage) {
      if (error.response?.data?.message) {
        return error.response.data.message
      }
      if (error.response?.data?.error) {
        return error.response.data.error
      }
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        if (typeof errors === 'object') {
          const firstError = Object.values(errors)[0]
          return Array.isArray(firstError) ? firstError[0] : firstError
        }
      }
      if (error.message) {
        return error.message
      }
      return defaultMessage
    },

    clearError() {
      this.error = null
    },

    checkAuthStatus() {
      if (!this.isAuthenticated) return false

      const lastActivity = localStorage.getItem('last_activity')
      if (lastActivity) {
        const timeDiff = Date.now() - parseInt(lastActivity)
        const maxInactivity = 24 * 60 * 60 * 1000 // 24 hours

        if (timeDiff > maxInactivity) {
          this.clearAuth()
          return false
        }
      }

      return true
    }
  }
})
