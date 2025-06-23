<template>
  <div class="blog-editor">
    <form @submit.prevent="handleSubmit">
      <!-- Editor Header -->
      <div class="editor-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">{{ isEditing ? 'Edit Blog Post' : 'Create New Blog Post' }}</h2>
          <p class="text-muted mb-0">{{ getSubtitle() }}</p>
        </div>
        
        <div class="header-actions d-flex gap-2">
          <!-- Removed preview and save draft buttons -->
        </div>
      </div>

      <!-- Main Content -->
      <div class="row">
        <!-- Left Column - Main Content -->
        <div class="col-lg-8">
          <div class="content-section">
            <!-- Title -->
            <div class="mb-4">
              <label class="form-label required">Title</label>
              <input
                type="text"
                class="form-control form-control-lg"
                v-model="blogData.title"
                placeholder="Enter an engaging blog title..."
                required
                :class="{ 'is-invalid': errors.title }"
                @input="clearError('title')"
              >
              <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
              <div class="form-text">
                <span :class="{ 'text-danger': blogData.title.length > 100 }">
                  {{ blogData.title.length }}/100 characters
                </span>
              </div>
            </div>

            <!-- Excerpt -->
            <div class="mb-4">
              <label class="form-label required">Excerpt</label>
              <textarea
                class="form-control"
                v-model="blogData.excerpt"
                rows="3"
                placeholder="Write a compelling excerpt that summarizes your blog post..."
                required
                :class="{ 'is-invalid': errors.excerpt }"
                @input="clearError('excerpt')"
              ></textarea>
              <div v-if="errors.excerpt" class="invalid-feedback">{{ errors.excerpt }}</div>
              <div class="form-text">
                <span :class="{ 'text-danger': blogData.excerpt.length > 300 }">
                  {{ blogData.excerpt.length }}/300 characters
                </span>
              </div>
            </div>

            <!-- Featured Image -->
            <div class="mb-4">
              <ImageUpload
                v-model="blogData.image_url"
                v-model:image-alt="blogData.image_alt"
                :required="false"
                @upload-success="handleImageUpload"
                @upload-error="handleImageError"
              />
            </div>

            <!-- Content -->
            <div class="mb-4">
              <label class="form-label required">Content</label>
              <MarkdownEditor
                ref="markdownEditor"
                v-model="blogData.description"
                placeholder="Write your blog content here... Use markdown for formatting."
                :rows="15"
                :show-footer="true"

              />
              <div v-if="errors.description" class="text-danger mt-1">{{ errors.description }}</div>
            </div>
          </div>


        </div>

        <!-- Right Column - Sidebar -->
        <div class="col-lg-4">
          <div class="sidebar-section">
            <!-- Publishing Options -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-gear me-2"></i>
                  Publishing Options
                </h6>
              </div>
              <div class="card-body">
                <!-- Status -->
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="blogData.status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <!-- Scheduled Date (if scheduled) -->
                <div v-if="blogData.status === 'scheduled'" class="mb-3">
                  <label class="form-label">Publish Date & Time</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    v-model="blogData.scheduled_at"
                    :min="minDateTime"
                  >
                </div>

                <!-- Action Buttons -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="!isFormValid || saving"
                  >
                    <span v-if="saving && saveAction === 'publish'" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi" :class="getSubmitIcon()"></i>
                    {{ getSubmitText() }}
                  </button>
                  
                  <button
                    v-if="isEditing"
                    type="button"
                    class="btn btn-outline-danger"
                    @click="deleteBlog"
                    :disabled="saving"
                  >
                    <i class="bi bi-trash me-1"></i>
                    Delete Blog
                  </button>
                </div>
              </div>
            </div>

            <!-- Tags & Keywords -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-tags me-2"></i>
                  Tags & Keywords
                </h6>
              </div>
              <div class="card-body">
                <TagInput
                  v-model="blogData.tags"
                  label="Tags"
                  placeholder="Add tags to categorize your blog..."
                  help-text="Tags help readers find your content"
                  :max-tags="8"
                  class="mb-3"
                />

                <TagInput
                  v-model="blogData.keywords"
                  label="SEO Keywords"
                  placeholder="Add keywords for SEO..."
                  help-text="Keywords improve search engine visibility"
                  :max-tags="10"
                  :show-popular-tags="false"
                />
              </div>
            </div>




          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show mt-4">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''"></button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show mt-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''"></button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { blogService } from '../services/blog.js'
import MarkdownEditor from './MarkdownEditor.vue'
import ImageUpload from './ImageUpload.vue'
import TagInput from './TagInput.vue'

const props = defineProps({
  blogId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['blog-created', 'blog-updated', 'blog-deleted'])

const router = useRouter()
const authStore = useAuthStore()

// State
const blogData = reactive({
  title: '',
  excerpt: '',
  description: '',
  image: '',
  image_url: '',
  image_alt: '',
  tags: [],
  keywords: [],

  status: 'draft',
  scheduled_at: ''
})

const errors = reactive({})
const saving = ref(false)
const saveAction = ref('')

const successMessage = ref('')
const errorMessage = ref('')

const markdownEditor = ref(null)
const originalData = ref({})

// Computed
const isEditing = computed(() => !!props.blogId)
const currentUser = computed(() => authStore.user)

const hasChanges = computed(() => {
  return JSON.stringify(blogData) !== JSON.stringify(originalData.value)
})

const isFormValid = computed(() => {
  return blogData.title.trim() && 
         blogData.excerpt.trim() && 
         blogData.description.trim() &&
         Object.keys(errors).length === 0
})



const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
  return now.toISOString().slice(0, 16)
})

// Methods
const getSubtitle = () => {
  if (isEditing.value) {
    return 'Update your blog post content and settings'
  }
  return 'Share your thoughts and ideas with the world'
}

const getSubmitText = () => {
  if (blogData.status === 'scheduled') return 'Schedule Blog'
  if (blogData.status === 'published') return isEditing.value ? 'Update & Publish' : 'Publish Blog'
  return isEditing.value ? 'Update Draft' : 'Save as Draft'
}

const getSubmitIcon = () => {
  if (blogData.status === 'scheduled') return 'bi-clock'
  if (blogData.status === 'published') return 'bi-globe'
  return 'bi-file-earmark'
}

const loadBlog = async () => {
  if (!props.blogId) return

  try {
    const response = await blogService.getBlog(props.blogId)
    const blog = response.data

    console.log('Loading blog for edit:', blog)
    console.log('Blog image_url:', blog.image_url)

    // Populate form with blog data
    Object.assign(blogData, {
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      description: blog.description || '',
      image: blog.image || '',
      image_url: blog.image_url || '', // Full URL for display
      image_alt: blog.image_alt || '',
      tags: blog.tags?.map(tag => tag.name) || [],
      keywords: blog.keywords || [],
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      status: blog.status || 'draft',
      scheduled_at: blog.scheduled_at || ''
    })

    // Store original data for change detection
    originalData.value = JSON.parse(JSON.stringify(blogData))



  } catch (error) {
    console.error('Error loading blog:', error)
    errorMessage.value = 'Failed to load blog data'
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  saving.value = true
  saveAction.value = 'publish'
  errorMessage.value = ''

  try {
    const submitData = {
      title: blogData.title,
      excerpt: blogData.excerpt,
      description: blogData.description,
      tags: blogData.tags, // Send tags as array of strings
      keywords: blogData.keywords,
      status: blogData.status,
      // Format scheduled_at properly or remove if empty
      scheduled_at: blogData.scheduled_at && blogData.status === 'scheduled'
        ? new Date(blogData.scheduled_at).toISOString()
        : null
    }

    // Add image fields if image exists
    if (blogData.image_url) {
      submitData.image = blogData.image_url // Send full URL as per API guide
      submitData.image_alt = blogData.image_alt
    }

    console.log('Submitting blog data:', submitData)

    let response
    if (isEditing.value) {
      response = await blogService.updateBlog(props.blogId, submitData)
      emit('blog-updated', response.data)
      successMessage.value = 'Blog updated successfully!'
    } else {
      response = await blogService.createBlog(submitData)
      emit('blog-created', response.data)
      successMessage.value = 'Blog created successfully!'
      
      // Redirect to edit mode
      router.push(`/blog/edit/${response.data.id}`)
    }

    // Update original data
    originalData.value = JSON.parse(JSON.stringify(blogData))

  } catch (error) {
    console.error('Error saving blog:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to save blog'
  } finally {
    saving.value = false
  }
}



const deleteBlog = async () => {
  if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
    return
  }

  saving.value = true

  try {
    await blogService.deleteBlog(props.blogId)
    emit('blog-deleted', props.blogId)
    successMessage.value = 'Blog deleted successfully!'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)

  } catch (error) {
    console.error('Error deleting blog:', error)
    errorMessage.value = 'Failed to delete blog'
  } finally {
    saving.value = false
  }
}

const validateForm = () => {
  const newErrors = {}

  if (!blogData.title.trim()) {
    newErrors.title = 'Title is required'
  } else if (blogData.title.length > 100) {
    newErrors.title = 'Title must be less than 100 characters'
  }

  if (!blogData.excerpt.trim()) {
    newErrors.excerpt = 'Excerpt is required'
  } else if (blogData.excerpt.length > 300) {
    newErrors.excerpt = 'Excerpt must be less than 300 characters'
  }

  if (!blogData.description.trim()) {
    newErrors.description = 'Content is required'
  }

  if (blogData.status === 'scheduled' && !blogData.scheduled_at) {
    newErrors.scheduled_at = 'Scheduled date is required'
  }

  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const clearError = (field) => {
  if (errors[field]) {
    delete errors[field]
  }
}



const handleImageUpload = (imageData) => {
  successMessage.value = 'Image uploaded successfully!'
}

const handleImageError = (error) => {
  errorMessage.value = 'Failed to upload image'
}

const autoGenerateSEO = () => {
  if (blogData.title && !blogData.meta_title) {
    blogData.meta_title = blogData.title.substring(0, 60)
  }
  
  if (blogData.excerpt && !blogData.meta_description) {
    blogData.meta_description = blogData.excerpt.substring(0, 160)
  }
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}



onMounted(() => {
  if (props.blogId) {
    loadBlog()
  }
})
</script>

<style scoped>
.blog-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.editor-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.content-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.sidebar-section {
  position: sticky;
  top: 2rem;
}

.card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #dee2e6;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.required::after {
  content: " *";
  color: #dc3545;
}



.stat-item {
  padding: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d6efd;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 992px) {
  .sidebar-section {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .blog-editor {
    padding: 1rem;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  

}

/* Animation for alerts */
.alert {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
