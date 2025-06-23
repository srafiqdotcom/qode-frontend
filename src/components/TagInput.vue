<template>
  <div class="tag-input-container">
    <label v-if="label" class="form-label">{{ label }}</label>
    
    <div class="tag-input-wrapper" :class="{ 'focused': isFocused }">
      <!-- Selected Tags -->
      <div v-if="selectedTags.length > 0" class="selected-tags">
        <span
          v-for="(tag, index) in selectedTags"
          :key="index"
          class="tag-item"
          :class="{ 'duplicate': isDuplicate(tag) }"
        >
          {{ tag }}
          <button
            type="button"
            class="tag-remove"
            @click="removeTag(index)"
            :title="`Remove ${tag}`"
          >
            <i class="bi bi-x"></i>
          </button>
        </span>
      </div>

      <!-- Input Field -->
      <div class="input-container">
        <input
          ref="inputRef"
          type="text"
          class="tag-input"
          v-model="inputValue"
          :placeholder="effectivePlaceholder"
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
        >
      </div>
    </div>



    <!-- Help Text -->
    <div v-if="helpText" class="form-text">
      <i class="bi bi-info-circle me-1"></i>
      {{ helpText }}
    </div>

    <!-- Validation Messages -->
    <div v-if="validationMessage" class="validation-message" :class="validationType">
      <i class="bi" :class="validationIcon"></i>
      {{ validationMessage }}
    </div>

    <!-- Popular Tags -->
    <div v-if="showPopularTags && popularTags.length > 0" class="popular-tags mt-2">
      <small class="text-muted">Popular tags:</small>
      <div class="popular-tags-list mt-1">
        <button
          v-for="tag in popularTags.slice(0, 8)"
          :key="tag.id"
          type="button"
          class="btn btn-sm btn-outline-secondary me-1 mb-1"
          :class="{ 'active': selectedTags.includes(tag.name) }"
          @click="togglePopularTag(tag.name)"
          :disabled="selectedTags.includes(tag.name)"
        >
          {{ tag.name }}
          <span class="badge bg-light text-dark ms-1">{{ tag.blogs_count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { tagService } from '../services/tag.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Type and press Enter to add tags...'
  },
  helpText: {
    type: String,
    default: 'Press Enter or comma to add tags. Use suggestions for existing tags.'
  },
  maxTags: {
    type: Number,
    default: 10
  },
  minTagLength: {
    type: Number,
    default: 2
  },
  maxTagLength: {
    type: Number,
    default: 30
  },
  allowDuplicates: {
    type: Boolean,
    default: false
  },
  showSuggestions: {
    type: Boolean,
    default: true
  },
  showPopularTags: {
    type: Boolean,
    default: true
  },
  validateTags: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'tag-added', 'tag-removed'])

// State
const selectedTags = ref([...props.modelValue])
const inputValue = ref('')
const popularTags = ref([])
const isFocused = ref(false)
const inputRef = ref(null)
const validationMessage = ref('')
const validationType = ref('')



// Computed
const effectivePlaceholder = computed(() => {
  if (selectedTags.value.length >= props.maxTags) {
    return `Maximum ${props.maxTags} tags allowed`
  }
  return selectedTags.value.length === 0 ? props.placeholder : 'Add another tag...'
})

const validationIcon = computed(() => {
  switch (validationType.value) {
    case 'error': return 'bi-exclamation-triangle-fill'
    case 'warning': return 'bi-exclamation-circle-fill'
    case 'success': return 'bi-check-circle-fill'
    default: return 'bi-info-circle'
  }
})

// Methods
const handleInput = () => {
  clearValidation()
}

const handleKeydown = (event) => {
  switch (event.key) {
    case 'Enter':
    case ',':
      event.preventDefault()
      if (inputValue.value.trim()) {
        addTag(inputValue.value.trim())
      }
      break
    case 'Backspace':
      if (!inputValue.value && selectedTags.value.length > 0) {
        removeTag(selectedTags.value.length - 1)
      }
      break
  }
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const addTag = (tagName) => {
  const trimmedTag = tagName.trim()

  if (!validateTag(trimmedTag)) return

  selectedTags.value.push(trimmedTag)
  inputValue.value = ''

  emit('update:modelValue', selectedTags.value)
  emit('tag-added', trimmedTag)

  showValidation('Tag added successfully', 'success')
}

const removeTag = (index) => {
  const removedTag = selectedTags.value[index]
  selectedTags.value.splice(index, 1)
  
  emit('update:modelValue', selectedTags.value)
  emit('tag-removed', removedTag)
  
  // Focus input after removing tag
  nextTick(() => {
    inputRef.value?.focus()
  })
}



const togglePopularTag = (tagName) => {
  if (!selectedTags.value.includes(tagName)) {
    addTag(tagName)
  }
}

const validateTag = (tag) => {
  // Check length
  if (tag.length < props.minTagLength) {
    showValidation(`Tag must be at least ${props.minTagLength} characters`, 'error')
    return false
  }
  
  if (tag.length > props.maxTagLength) {
    showValidation(`Tag must be less than ${props.maxTagLength} characters`, 'error')
    return false
  }
  
  // Check duplicates
  if (!props.allowDuplicates && selectedTags.value.includes(tag)) {
    showValidation('Tag already exists', 'warning')
    return false
  }
  
  // Check max tags
  if (selectedTags.value.length >= props.maxTags) {
    showValidation(`Maximum ${props.maxTags} tags allowed`, 'error')
    return false
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
    showValidation('Tag contains invalid characters', 'error')
    return false
  }
  
  return true
}

const isDuplicate = (tag) => {
  return selectedTags.value.filter(t => t === tag).length > 1
}

const showValidation = (message, type) => {
  validationMessage.value = message
  validationType.value = type
  
  setTimeout(() => {
    clearValidation()
  }, 3000)
}

const clearValidation = () => {
  validationMessage.value = ''
  validationType.value = ''
}



const loadPopularTags = async () => {
  if (!props.showPopularTags) return

  try {
    const response = await tagService.getTags({ per_page: 12 })
    // Handle Laravel pagination response structure
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      popularTags.value = response.data.data.filter(tag => tag && tag.id && tag.name)
    } else {
      popularTags.value = []
    }
  } catch (error) {
    console.error('Error loading tags:', error)
    popularTags.value = []
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (JSON.stringify(newValue) !== JSON.stringify(selectedTags.value)) {
    selectedTags.value = [...newValue]
  }
}, { deep: true })

onMounted(() => {
  loadPopularTags()
})
</script>

<style scoped>
.tag-input-container {
  position: relative;
}

.tag-input-wrapper {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background-color: white;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  min-height: 42px;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.tag-input-wrapper.focused {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-right: 0.5rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background-color: #0d6efd;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.25rem;
}

.tag-item.duplicate {
  background-color: #dc3545;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tag-remove:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.input-container {
  flex: 1;
  min-width: 120px;
}

.tag-input {
  border: none;
  outline: none;
  background: none;
  width: 100%;
  padding: 0;
  font-size: 1rem;
}

.tag-input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}



.validation-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.validation-message.error {
  color: #dc3545;
}

.validation-message.warning {
  color: #fd7e14;
}

.validation-message.success {
  color: #198754;
}

.popular-tags-list .btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tag-input-wrapper {
    padding: 0.375rem;
  }
  
  .tag-item {
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
  }
  
  .popular-tags-list .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tag-input-wrapper {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .tag-input-wrapper.focused {
    border-color: #4299e1;
    box-shadow: 0 0 0 0.25rem rgba(66, 153, 225, 0.25);
  }
  

}
</style>
