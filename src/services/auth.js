import api from './api.js'

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/api/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  async requestOtp(email) {
    try {
      const response = await api.post('/api/auth/request-otp', { email })
      return response.data
    } catch (error) {
      console.error('Request OTP error:', error)
      throw error
    }
  },

  async verifyOtp(email, otpCode) {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email,
        otp_code: otpCode,
        purpose: 'login'
      })

      if (response.data.data.token && response.data.data.user) {
        this.setAuthData(response.data.data.token, response.data.data.user)
      } else {
        throw new Error('Invalid response: missing token or user data')
      }

      return response.data
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw error
    }
  },

  async logout() {
    try {
      const token = this.getToken()
      if (token) {
        await api.post('/api/auth/logout')
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      this.clearStorage()
    }
  },

  setAuthData(token, user) {
    try {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('auth_timestamp', Date.now().toString())
    } catch (error) {
      console.error('Error saving auth data:', error)
      throw new Error('Failed to save authentication data')
    }
  },

  clearStorage() {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth_timestamp')
      localStorage.removeItem('last_activity')
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.clearStorage()
      return null
    }
  },

  getToken() {
    try {
      return localStorage.getItem('access_token')
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  },

  isAuthenticated() {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  },

  getAuthTimestamp() {
    try {
      const timestamp = localStorage.getItem('auth_timestamp')
      return timestamp ? parseInt(timestamp) : null
    } catch (error) {
      console.error('Error getting auth timestamp:', error)
      return null
    }
  },

  isTokenExpired() {
    const timestamp = this.getAuthTimestamp()
    if (!timestamp) return true

    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return (now - timestamp) > maxAge
  }
}
