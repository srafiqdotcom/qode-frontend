<template>
  <div class="loading-spinner" :class="[`size-${size}`, `variant-${variant}`, { 'with-overlay': overlay }]">
    <div v-if="overlay" class="spinner-overlay"></div>
    
    <div class="spinner-container" :class="{ 'centered': center }">
      <!-- Default Bootstrap Spinner -->
      <div v-if="type === 'default'" class="spinner-border" :class="spinnerClasses" role="status">
        <span class="visually-hidden">{{ text }}</span>
      </div>
      
      <!-- Dots Spinner -->
      <div v-else-if="type === 'dots'" class="spinner-dots">
        <div class="dot" v-for="i in 3" :key="i"></div>
      </div>
      
      <!-- Pulse Spinner -->
      <div v-else-if="type === 'pulse'" class="spinner-pulse">
        <div class="pulse-circle"></div>
      </div>
      
      <!-- Bars Spinner -->
      <div v-else-if="type === 'bars'" class="spinner-bars">
        <div class="bar" v-for="i in 4" :key="i"></div>
      </div>
      
      <!-- Ring Spinner -->
      <div v-else-if="type === 'ring'" class="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      
      <!-- Text -->
      <div v-if="text && showText" class="spinner-text">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dots', 'pulse', 'bars', 'ring'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  text: {
    type: String,
    default: 'Loading...'
  },
  showText: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: false
  },
  overlay: {
    type: Boolean,
    default: false
  }
})

const spinnerClasses = computed(() => {
  const classes = []
  
  if (props.variant !== 'primary') {
    classes.push(`text-${props.variant}`)
  }
  
  if (props.size !== 'md') {
    classes.push(`spinner-border-${props.size}`)
  }
  
  return classes
})
</script>

<style scoped>
.loading-spinner {
  position: relative;
}

.loading-spinner.with-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
}

.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.spinner-container.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner.with-overlay .spinner-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1051;
}

/* Size variants */
.size-xs .spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.1em;
}

.size-sm .spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.15em;
}

.size-lg .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.size-xl .spinner-border {
  width: 4rem;
  height: 4rem;
  border-width: 0.4em;
}

/* Dots Spinner */
.spinner-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.spinner-dots .dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: currentColor;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.spinner-dots .dot:nth-child(1) { animation-delay: -0.32s; }
.spinner-dots .dot:nth-child(2) { animation-delay: -0.16s; }

.size-xs .spinner-dots .dot { width: 0.3rem; height: 0.3rem; }
.size-sm .spinner-dots .dot { width: 0.4rem; height: 0.4rem; }
.size-lg .spinner-dots .dot { width: 0.7rem; height: 0.7rem; }
.size-xl .spinner-dots .dot { width: 1rem; height: 1rem; }

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse Spinner */
.spinner-pulse {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.pulse-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 1.5s infinite ease-in-out;
}

.size-xs .spinner-pulse { width: 1rem; height: 1rem; }
.size-sm .spinner-pulse { width: 1.5rem; height: 1.5rem; }
.size-lg .spinner-pulse { width: 3rem; height: 3rem; }
.size-xl .spinner-pulse { width: 4rem; height: 4rem; }

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Bars Spinner */
.spinner-bars {
  display: flex;
  gap: 0.2rem;
  align-items: end;
  height: 2rem;
}

.spinner-bars .bar {
  width: 0.3rem;
  background-color: currentColor;
  animation: barStretch 1.2s infinite ease-in-out;
}

.spinner-bars .bar:nth-child(1) { animation-delay: -1.1s; }
.spinner-bars .bar:nth-child(2) { animation-delay: -1.0s; }
.spinner-bars .bar:nth-child(3) { animation-delay: -0.9s; }
.spinner-bars .bar:nth-child(4) { animation-delay: -0.8s; }

.size-xs .spinner-bars { height: 1rem; }
.size-xs .spinner-bars .bar { width: 0.2rem; }
.size-sm .spinner-bars { height: 1.5rem; }
.size-sm .spinner-bars .bar { width: 0.25rem; }
.size-lg .spinner-bars { height: 3rem; }
.size-lg .spinner-bars .bar { width: 0.4rem; }
.size-xl .spinner-bars { height: 4rem; }
.size-xl .spinner-bars .bar { width: 0.5rem; }

@keyframes barStretch {
  0%, 40%, 100% {
    height: 0.5rem;
  }
  20% {
    height: 100%;
  }
}

/* Ring Spinner */
.spinner-ring {
  position: relative;
  width: 2rem;
  height: 2rem;
}

.spinner-ring div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0.2rem solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ringRotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring div:nth-child(3) { animation-delay: -0.15s; }

.size-xs .spinner-ring { width: 1rem; height: 1rem; }
.size-xs .spinner-ring div { border-width: 0.1rem; }
.size-sm .spinner-ring { width: 1.5rem; height: 1.5rem; }
.size-sm .spinner-ring div { border-width: 0.15rem; }
.size-lg .spinner-ring { width: 3rem; height: 3rem; }
.size-lg .spinner-ring div { border-width: 0.3rem; }
.size-xl .spinner-ring { width: 4rem; height: 4rem; }
.size-xl .spinner-ring div { border-width: 0.4rem; }

@keyframes ringRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Spinner Text */
.spinner-text {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
}

.size-xs .spinner-text { font-size: 0.75rem; }
.size-sm .spinner-text { font-size: 0.8rem; }
.size-lg .spinner-text { font-size: 1rem; }
.size-xl .spinner-text { font-size: 1.1rem; }

/* Color variants */
.variant-primary { color: #0d6efd; }
.variant-secondary { color: #6c757d; }
.variant-success { color: #198754; }
.variant-danger { color: #dc3545; }
.variant-warning { color: #ffc107; }
.variant-info { color: #0dcaf0; }
.variant-light { color: #f8f9fa; }
.variant-dark { color: #212529; }

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .spinner-overlay {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  .spinner-text {
    color: #a0aec0;
  }
  
  .variant-light { color: #2d3748; }
  .variant-dark { color: #e2e8f0; }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .spinner-border,
  .dot,
  .pulse-circle,
  .bar,
  .spinner-ring div {
    animation-duration: 2s;
  }
}
</style>
