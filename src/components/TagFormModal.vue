<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi me-2" :class="isEditing ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
            {{ isEditing ? 'Edit Tag' : 'Create New Tag' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="row">
              <!-- Left Column -->
              <div class="col-md-8">
                <!-- Tag Name -->
                <div class="mb-3">
                  <label class="form-label required">Tag Name</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.name"
                    placeholder="Enter tag name..."
                    required
                    :class="{ 'is-invalid': errors.name }"
                    @input="handleNameInput"
                  >
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                  <div class="form-text">
                    <span :class="{ 'text-danger': formData.name.length > 50 }">
                      {{ formData.name.length }}/50 characters
                    </span>
                  </div>
                </div>

                <!-- Tag Slug -->
                <div class="mb-3">
                  <label class="form-label">Slug</label>
                  <div class="input-group">
                    <span class="input-group-text">/tags/</span>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.slug"
                      placeholder="auto-generated"
                      :class="{ 'is-invalid': errors.slug }"
                      @input="handleSlugInput"
                    >
                  </div>
                  <div v-if="errors.slug" class="invalid-feedback">{{ errors.slug }}</div>
                  <div class="form-text">
                    URL-friendly version of the tag name. Leave empty to auto-generate.
                  </div>
                </div>

                <!-- Tag Description -->
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    v-model="formData.description"
                    rows="3"
                    placeholder="Describe what this tag represents..."
                    :class="{ 'is-invalid': errors.description }"
                  ></textarea>
                  <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
                  <div class="form-text">
                    <span :class="{ 'text-danger': formData.description.length > 200 }">
                      {{ formData.description.length }}/200 characters
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="col-md-4">
                <!-- Color Picker -->
                <div class="mb-3">
                  <label class="form-label">Tag Color</label>
                  <div class="color-picker-section">
                    <!-- Color Input -->
                    <div class="color-input-group">
                      <input
                        type="color"
                        class="form-control form-control-color"
                        v-model="formData.color"
                        title="Choose tag color"
                      >
                      <input
                        type="text"
                        class="form-control"
                        v-model="formData.color"
                        placeholder="#000000"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      >
                    </div>
                    
                    <!-- Preset Colors -->
                    <div class="preset-colors">
                      <button
                        v-for="color in presetColors"
                        :key="color"
                        type="button"
                        class="color-preset"
                        :style="{ backgroundColor: color }"
                        :class="{ active: formData.color === color }"
                        @click="formData.color = color"
                        :title="color"
                      ></button>
                    </div>
                  </div>
                </div>

                <!-- Preview -->
                <div class="mb-3">
                  <label class="form-label">Preview</label>
                  <div class="tag-preview">
                    <span 
                      class="badge tag-preview-badge"
                      :style="{ 
                        backgroundColor: formData.color,
                        color: getContrastColor(formData.color)
                      }"
                    >
                      {{ formData.name || 'Tag Name' }}
                    </span>
                    <div class="preview-info mt-2">
                      <small class="text-muted">
                        <strong>Slug:</strong> {{ formData.slug || generateSlug(formData.name) || 'tag-slug' }}
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Usage Info (for editing) -->
                <div v-if="isEditing && tag" class="mb-3">
                  <label class="form-label">Usage Statistics</label>
                  <div class="usage-stats">
                    <div class="stat-item">
                      <i class="bi bi-file-text text-primary"></i>
                      <span>{{ tag.blogs_count || 0 }} blogs</span>
                    </div>
                    <div class="stat-item">
                      <i class="bi bi-calendar text-muted"></i>
                      <span>Created {{ formatDate(tag.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error Display -->
            <div v-if="submitError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ submitError }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid || submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi me-1" :class="isEditing ? 'bi-check-lg' : 'bi-plus-lg'"></i>
              {{ isEditing ? 'Update Tag' : 'Create Tag' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { tagService } from '../services/tag.js'

const props = defineProps({
  tag: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

// State
const formData = reactive({
  name: '',
  slug: '',
  description: '',
  color: '#6c757d'
})

const errors = reactive({})
const submitting = ref(false)
const submitError = ref('')

// Preset colors
const presetColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
  '#6c757d', '#495057', '#343a40', '#212529', '#000000'
]

// Computed
const isFormValid = computed(() => {
  return formData.name.trim() && 
         formData.name.length <= 50 &&
         formData.description.length <= 200 &&
         Object.keys(errors).length === 0
})

// Methods
const generateSlug = (name) => {
  if (!name) return ''
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const handleNameInput = () => {
  clearError('name')
  
  // Auto-generate slug if not manually edited
  if (!formData.slug || formData.slug === generateSlug(formData.name)) {
    formData.slug = generateSlug(formData.name)
  }
  
  // Validate name
  if (formData.name.length > 50) {
    errors.name = 'Tag name must be 50 characters or less'
  }
}

const handleSlugInput = () => {
  clearError('slug')
  
  // Validate slug format
  const slugPattern = /^[a-z0-9-]+$/
  if (formData.slug && !slugPattern.test(formData.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
  }
}

const clearError = (field) => {
  if (errors[field]) {
    delete errors[field]
  }
}

const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid'
  }
}

const validateForm = () => {
  const newErrors = {}

  if (!formData.name.trim()) {
    newErrors.name = 'Tag name is required'
  } else if (formData.name.length > 50) {
    newErrors.name = 'Tag name must be 50 characters or less'
  }

  if (formData.description.length > 200) {
    newErrors.description = 'Description must be 200 characters or less'
  }

  if (formData.slug) {
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  submitError.value = ''

  try {
    const submitData = {
      name: formData.name.trim(),
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description.trim(),
      color: formData.color
    }

    let response
    if (props.isEditing) {
      response = await tagService.updateTag(props.tag.id, submitData)
    } else {
      response = await tagService.createTag(submitData)
    }

    emit('saved', response.data)

  } catch (error) {
    console.error('Error saving tag:', error)
    submitError.value = error.message || 'Failed to save tag'
  } finally {
    submitting.value = false
  }
}

// Initialize form data
const initializeForm = () => {
  if (props.isEditing && props.tag) {
    formData.name = props.tag.name || ''
    formData.slug = props.tag.slug || ''
    formData.description = props.tag.description || ''
    formData.color = props.tag.color || '#6c757d'
  } else {
    formData.name = ''
    formData.slug = ''
    formData.description = ''
    formData.color = '#6c757d'
  }
  
  // Clear errors
  Object.keys(errors).forEach(key => delete errors[key])
  submitError.value = ''
}

onMounted(() => {
  initializeForm()
})

watch(() => props.tag, () => {
  initializeForm()
}, { deep: true })
</script>

<style scoped>
.required::after {
  content: " *";
  color: #dc3545;
}

.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
}

.form-control-color {
  width: 50px;
  height: 38px;
  padding: 0.25rem;
  border-radius: 0.375rem;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.color-preset {
  width: 30px;
  height: 30px;
  border: 2px solid #dee2e6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preset:hover {
  transform: scale(1.1);
  border-color: #0d6efd;
}

.color-preset.active {
  border-color: #0d6efd;
  border-width: 3px;
  transform: scale(1.1);
}

.tag-preview {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  text-align: center;
}

.tag-preview-badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .preset-colors {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .color-preset {
    width: 25px;
    height: 25px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tag-preview {
    background-color: #4a5568;
    border-color: #718096;
  }
  
  .color-preset {
    border-color: #4a5568;
  }
  
  .color-preset:hover,
  .color-preset.active {
    border-color: #4299e1;
  }
}

/* Animation for modal */
.modal {
  animation: fadeIn 0.3s ease-out;
}

.modal-dialog {
  animation: slideInDown 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
