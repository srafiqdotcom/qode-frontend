<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ getModalTitle() }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="authStore.error" class="alert alert-danger alert-dismissible">
            {{ authStore.error }}
            <button type="button" class="btn-close" @click="authStore.clearError()"></button>
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <div v-if="showOtpSentMessage" class="alert alert-info">
            <i class="bi bi-envelope-check me-2"></i>
            OTP has been sent to <strong>{{ form.email }}</strong>. Please check your email and enter the 6-digit code below.
          </div>

          <form @submit.prevent="handleSubmit">
            <div v-if="!isLogin && !showOtpField" class="mb-3">
              <label class="form-label">Full Name *</label>
              <input
                type="text"
                class="form-control"
                v-model="form.name"
                :disabled="authStore.loading"
                required
                placeholder="Enter your full name"
              >
            </div>

            <div v-if="!showOtpField" class="mb-3">
              <label class="form-label">Email Address *</label>
              <input
                type="email"
                class="form-control"
                v-model="form.email"
                :disabled="authStore.loading"
                required
                placeholder="Enter your email address"
              >
            </div>

            <div v-if="!isLogin && !showOtpField" class="mb-3">
              <label class="form-label">Account Type *</label>
              <select class="form-select" v-model="form.role" :disabled="authStore.loading">
                <option value="reader">Reader - Browse and comment on blogs</option>
                <option value="author">Author - Create and manage blogs</option>
              </select>
            </div>

            <div v-if="showOtpField" class="mb-3">
              <label class="form-label">Verification Code *</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control text-center fs-5 letter-spacing-wide"
                  v-model="form.otpCode"
                  :disabled="authStore.loading"
                  placeholder="000000"
                  maxlength="6"
                  pattern="[0-9]{6}"
                  style="letter-spacing: 0.5em;"
                  @input="formatOtpInput"
                  ref="otpInput"
                >
              </div>
              <small class="form-text text-muted">
                Enter the 6-digit code sent to your email
              </small>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 mb-3"
              :disabled="authStore.loading || (showOtpField && form.otpCode.length !== 6)"
            >
              <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ getSubmitButtonText() }}
            </button>
          </form>

          <div v-if="showOtpField" class="text-center mb-3">
            <button
              type="button"
              class="btn btn-link btn-sm"
              @click="resendOtp"
              :disabled="authStore.loading || resendCooldown > 0"
            >
              <span v-if="resendCooldown > 0">
                Resend OTP in {{ resendCooldown }}s
              </span>
              <span v-else>
                Resend OTP
              </span>
            </button>
          </div>

          <div class="text-center">
            <button
              type="button"
              class="btn btn-link"
              @click="toggleMode"
              :disabled="authStore.loading"
            >
              {{ isLogin ? 'Need an account? Register here' : 'Already have an account? Login here' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const isLogin = ref(true)
const showOtpField = ref(false)
const otpSent = ref(false)
const successMessage = ref('')
const showOtpSentMessage = ref(false)
const resendCooldown = ref(0)
const otpInput = ref(null)

let resendTimer = null

const form = reactive({
  name: '',
  email: '',
  role: 'reader',
  otpCode: ''
})

const getModalTitle = () => {
  if (showOtpField.value) return 'Verify Your Email'
  return isLogin.value ? 'Welcome Back' : 'Create Account'
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  showOtpField.value = false
  otpSent.value = false
  showOtpSentMessage.value = false
  successMessage.value = ''
  form.otpCode = ''
  authStore.clearError()
  clearResendTimer()
}

const getSubmitButtonText = () => {
  if (showOtpField.value) return 'Verify & Login'
  if (isLogin.value) return 'Send Login Code'
  return 'Create Account & Send Code'
}

const formatOtpInput = (event) => {
  const value = event.target.value.replace(/\D/g, '')
  form.otpCode = value
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer)
    }
  }, 1000)
}

const clearResendTimer = () => {
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
  resendCooldown.value = 0
}

const resendOtp = async () => {
  try {
    await authStore.requestOtp(form.email)
    successMessage.value = 'New OTP sent successfully!'
    startResendCooldown()
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Resend OTP error:', error)
  }
}

const handleSubmit = async () => {
  try {
    authStore.clearError()

    if (!isLogin.value && !otpSent.value) {
      await authStore.register({
        name: form.name,
        email: form.email,
        role: form.role
      })

      await authStore.requestOtp(form.email)
      showOtpField.value = true
      otpSent.value = true
      showOtpSentMessage.value = true
      startResendCooldown()

      await nextTick()
      if (otpInput.value) {
        otpInput.value.focus()
      }

    } else if (isLogin.value && !showOtpField.value) {
      await authStore.requestOtp(form.email)
      showOtpField.value = true
      otpSent.value = true
      showOtpSentMessage.value = true
      startResendCooldown()

      await nextTick()
      if (otpInput.value) {
        otpInput.value.focus()
      }

    } else if (showOtpField.value) {
      await authStore.verifyOtp(form.email, form.otpCode)
      successMessage.value = 'Login successful! Welcome!'

      setTimeout(() => {
        emit('close')
      }, 1000)
    }
  } catch (error) {
    console.error('Auth error:', error)
  }
}

onMounted(() => {
  authStore.clearError()
})

onUnmounted(() => {
  clearResendTimer()
})
</script>
