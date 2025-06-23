<template>
  <div 
    v-if="show" 
    class="toast-container position-fixed top-0 end-0 p-3" 
    style="z-index: 1055;"
  >
    <div 
      class="toast show" 
      role="alert" 
      :class="toastClass"
    >
      <div class="toast-header">
        <i :class="iconClass" class="me-2"></i>
        <strong class="me-auto">{{ title }}</strong>
        <button 
          type="button" 
          class="btn-close" 
          @click="close"
        ></button>
      </div>
      <div class="toast-body">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const show = ref(false)

const toastClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'border-success'
    case 'error':
      return 'border-danger'
    case 'warning':
      return 'border-warning'
    default:
      return 'border-info'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bi bi-check-circle-fill text-success'
    case 'error':
      return 'bi bi-exclamation-circle-fill text-danger'
    case 'warning':
      return 'bi bi-exclamation-triangle-fill text-warning'
    default:
      return 'bi bi-info-circle-fill text-info'
  }
})

const defaultTitle = computed(() => {
  if (props.title) return props.title
  
  switch (props.type) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Error'
    case 'warning':
      return 'Warning'
    default:
      return 'Information'
  }
})

const close = () => {
  show.value = false
  emit('close')
}

onMounted(() => {
  show.value = true
  
  if (props.autoClose && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  min-width: 300px;
}
</style>
