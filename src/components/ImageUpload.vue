<template>
  <div class="image-upload-container">
    <div class="upload-area" :class="{ 'dragover': isDragOver, 'has-image': imageUrl }">
      <!-- Image Preview -->
      <div v-if="imageUrl" class="image-preview">
        <img :src="imageUrl" :alt="imageAlt || 'Uploaded image'" class="preview-image">
        <div class="image-overlay">
          <div class="overlay-actions">
            <button
              type="button"
              class="btn btn-sm btn-light"
              @click="editImage"
              title="Change image"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="removeImage"
              title="Remove image"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Area -->
      <div v-else class="upload-placeholder">
        <div
          class="drop-zone"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div v-if="uploading" class="upload-progress">
            <div class="spinner-border text-primary mb-2"></div>
            <p class="mb-0">Uploading image...</p>
            <div v-if="uploadProgress > 0" class="progress mt-2">
              <div
                class="progress-bar"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>

          <div v-else class="upload-content">
            <i class="bi bi-cloud-upload upload-icon"></i>
            <h6 class="upload-title">Upload Featured Image</h6>
            <p class="upload-description">
              Drag and drop an image here, or click to select
            </p>
            <div class="upload-specs">
              <small class="text-muted">
                Supports: JPG, PNG, WebP • Max size: {{ formatFileSize(maxFileSize) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        style="display: none"
      >
    </div>

    <!-- Image Alt Text -->
    <div v-if="imageUrl" class="mt-3">
      <label class="form-label">Image Alt Text</label>
      <input
        type="text"
        class="form-control"
        v-model="altText"
        placeholder="Describe the image for accessibility..."
        @input="updateAltText"
      >
      <div class="form-text">
        <i class="bi bi-info-circle me-1"></i>
        Alt text helps screen readers and improves SEO
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-danger mt-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>

    <!-- Upload Guidelines -->
    <div v-if="showGuidelines && !imageUrl" class="upload-guidelines mt-3">
      <h6 class="guidelines-title">
        <i class="bi bi-lightbulb me-1"></i>
        Image Guidelines
      </h6>
      <ul class="guidelines-list">
        <li>Use high-quality images (at least 800x400 pixels)</li>
        <li>Choose images relevant to your blog content</li>
        <li>Ensure you have rights to use the image</li>
        <li>Consider using free stock photo sites like Unsplash or Pexels</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { blogService } from '../services/blog.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  imageAlt: {
    type: String,
    default: ''
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  showGuidelines: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'update:imageAlt', 'upload-success', 'upload-error'])

// State
const imageUrl = ref(props.modelValue || '')
const altText = ref(props.imageAlt || '')
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDragOver = (event) => {
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file) => {
  // Validate file
  if (!validateFile(file)) return

  uploading.value = true
  uploadProgress.value = 0
  error.value = null

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 20
      }
    }, 200)

    const response = await blogService.uploadImage(file)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    console.log('Upload response:', response)
    console.log('Response data:', response.data)

    // Handle the Laravel API response structure as per integration guide
    let uploadedImageUrl = ''
    if (response.data && response.data.data) {
      // The URL is in response.data.data.url (as per your API response)
      uploadedImageUrl = response.data.data.url
    }

    console.log('Setting image URL to:', uploadedImageUrl)

    if (uploadedImageUrl) {
      imageUrl.value = uploadedImageUrl
      error.value = null // Clear any previous errors
      emit('update:modelValue', uploadedImageUrl)
      emit('upload-success', response.data)
    } else {
      console.error('No image URL found in response. Response structure:', response)
      throw new Error('No image URL found in response')
    }

    // Generate alt text suggestion based on filename
    if (!altText.value) {
      altText.value = generateAltTextSuggestion(file.name)
      updateAltText()
    }

  } catch (err) {
    console.error('Upload error:', err)
    console.error('Error response:', err.response)

    // Only show error if it's actually an error (not a successful upload)
    if (err.response?.status >= 400 || !err.response) {
      error.value = err.response?.data?.message || err.message || 'Failed to upload image. Please try again.'
      emit('upload-error', err)
    }
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const validateFile = (file) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select a valid image file (JPG, PNG, WebP, etc.)'
    return false
  }

  // Check file size
  if (file.size > props.maxFileSize) {
    error.value = `File size must be less than ${formatFileSize(props.maxFileSize)}`
    return false
  }

  return true
}

const removeImage = () => {
  imageUrl.value = ''
  altText.value = ''
  error.value = null
  emit('update:modelValue', '')
  emit('update:imageAlt', '')
}

const editImage = () => {
  triggerFileInput()
}

const updateAltText = () => {
  emit('update:imageAlt', altText.value)
}

const generateAltTextSuggestion = (filename) => {
  // Remove extension and replace hyphens/underscores with spaces
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  console.log('Props modelValue changed:', newValue)
  if (newValue !== imageUrl.value) {
    imageUrl.value = newValue || ''
    console.log('Updated imageUrl to:', imageUrl.value)
  }
}, { immediate: true })

watch(() => props.imageAlt, (newValue) => {
  if (newValue !== altText.value) {
    altText.value = newValue
  }
})

// Watch imageUrl changes for debugging
watch(imageUrl, (newValue) => {
  console.log('imageUrl reactive value changed to:', newValue)
})
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-area.dragover {
  border-color: #0d6efd;
  background-color: #f0f8ff;
}

.upload-area.has-image {
  border: 1px solid #dee2e6;
  border-style: solid;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 300px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-placeholder {
  padding: 2rem;
}

.drop-zone {
  text-align: center;
  padding: 2rem;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
}

.drop-zone:hover {
  background-color: #f8f9fa;
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.upload-title {
  color: #495057;
  margin-bottom: 0.5rem;
}

.upload-description {
  color: #6c757d;
  margin-bottom: 1rem;
}

.upload-specs {
  margin-top: 0.5rem;
}

.upload-progress {
  padding: 1rem;
}

.progress {
  height: 8px;
  border-radius: 4px;
}

.upload-guidelines {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.guidelines-title {
  color: #495057;
  margin-bottom: 0.75rem;
}

.guidelines-list {
  margin-bottom: 0;
  padding-left: 1.25rem;
}

.guidelines-list li {
  color: #6c757d;
  margin-bottom: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-placeholder {
    padding: 1.5rem;
  }
  
  .drop-zone {
    padding: 1.5rem;
  }
  
  .upload-icon {
    font-size: 2.5rem;
  }
  
  .image-preview {
    height: 200px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .upload-area {
    border-color: #4a5568;
    background-color: #2d3748;
  }
  
  .upload-area.dragover {
    border-color: #4299e1;
    background-color: #2a4a6b;
  }
  
  .drop-zone:hover {
    background-color: #4a5568;
  }
  
  .upload-guidelines {
    background-color: #4a5568;
  }
  
  .upload-title {
    color: #e2e8f0;
  }
  
  .upload-description,
  .guidelines-list li {
    color: #a0aec0;
  }
}
</style>
