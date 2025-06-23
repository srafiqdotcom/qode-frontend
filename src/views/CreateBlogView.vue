<template>
  <div class="create-blog-view">
    <!-- Page Header -->
    <div class="page-header bg-light border-bottom">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3">
          <div class="d-flex align-items-center">
            <RouterLink to="/dashboard" class="btn btn-outline-secondary me-3">
              <i class="bi bi-arrow-left me-1"></i>
              Back to Dashboard
            </RouterLink>
            <div>
              <h1 class="h4 mb-0">Create New Blog Post</h1>
              <small class="text-muted">Share your ideas with the world</small>
            </div>
          </div>
          
          <div class="header-status">
            <span v-if="autoSaveStatus" class="badge bg-success">
              <i class="bi bi-check-circle me-1"></i>
              {{ autoSaveStatus }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <BlogEditor
        @blog-created="handleBlogCreated"
        @blog-updated="handleBlogUpdated"
      />
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 text-center">
            <div class="w-100">
              <div class="success-icon mb-3">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
              </div>
              <h4 class="modal-title">Blog Created Successfully!</h4>
            </div>
          </div>
          <div class="modal-body text-center">
            <p class="mb-4">Your blog post has been created. What would you like to do next?</p>
            
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                @click="viewBlog"
              >
                <i class="bi bi-eye me-2"></i>
                View Blog Post
              </button>
              
              <button
                class="btn btn-outline-primary"
                @click="editBlog"
              >
                <i class="bi bi-pencil me-2"></i>
                Continue Editing
              </button>
              
              <button
                class="btn btn-outline-secondary"
                @click="createAnother"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Create Another Blog
              </button>
            </div>
          </div>
          <div class="modal-footer border-0 justify-content-center">
            <button
              type="button"
              class="btn btn-link text-muted"
              @click="goToDashboard"
            >
              <i class="bi bi-house me-1"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips Sidebar (Optional) -->
    <div v-if="showTips" class="tips-sidebar">
      <div class="tips-content">
        <div class="tips-header">
          <h6 class="mb-0">
            <i class="bi bi-lightbulb me-2"></i>
            Writing Tips
          </h6>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="showTips = false"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="tips-body">
          <div class="tip-item">
            <h6>📝 Engaging Titles</h6>
            <p>Use action words and numbers. Ask questions or make bold statements.</p>
          </div>
          
          <div class="tip-item">
            <h6>🎯 Clear Structure</h6>
            <p>Use headings, bullet points, and short paragraphs for better readability.</p>
          </div>
          
          <div class="tip-item">
            <h6>🖼️ Visual Appeal</h6>
            <p>Add a compelling featured image and break up text with visuals.</p>
          </div>
          
          <div class="tip-item">
            <h6>🏷️ Smart Tagging</h6>
            <p>Use 3-5 relevant tags to help readers discover your content.</p>
          </div>
          
          <div class="tip-item">
            <h6>🔍 SEO Optimization</h6>
            <p>Write descriptive meta titles and descriptions for better search visibility.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BlogEditor from '../components/BlogEditor.vue'

const router = useRouter()

// State
const showSuccessModal = ref(false)
const showTips = ref(true)
const autoSaveStatus = ref('')
const createdBlog = ref(null)

// Methods
const handleBlogCreated = (blog) => {
  createdBlog.value = blog
  showSuccessModal.value = true
  
  // Show auto-save status
  autoSaveStatus.value = 'Saved'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 3000)
}

const handleBlogUpdated = (blog) => {
  // Show auto-save status
  autoSaveStatus.value = 'Saved'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 3000)
}

const viewBlog = () => {
  if (createdBlog.value) {
    router.push(`/blog/${createdBlog.value.id}`)
  }
}

const editBlog = () => {
  if (createdBlog.value) {
    router.push(`/blog/edit/${createdBlog.value.id}`)
  }
}

const createAnother = () => {
  showSuccessModal.value = false
  createdBlog.value = null
  // Clear any saved drafts
  localStorage.removeItem('blog_draft')
  // Reload the page to reset the form
  window.location.reload()
}

const goToDashboard = () => {
  router.push('/dashboard')
}

// Auto-save status simulation
let autoSaveInterval = null

onMounted(() => {
  // Simulate auto-save status updates
  autoSaveInterval = setInterval(() => {
    const draft = localStorage.getItem('blog_draft')
    if (draft && !autoSaveStatus.value) {
      autoSaveStatus.value = 'Draft saved'
      setTimeout(() => {
        autoSaveStatus.value = ''
      }, 2000)
    }
  }, 10000) // Check every 10 seconds
})

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})
</script>

<style scoped>
.create-blog-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 1020;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.main-content {
  padding-bottom: 2rem;
}

.success-icon {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.tips-sidebar {
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  width: 300px;
  z-index: 1030;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(-50%);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(-50%);
  }
}

.tips-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #dee2e6;
  max-height: 80vh;
  overflow-y: auto;
}

.tips-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0.5rem 0.5rem 0 0;
}

.tips-body {
  padding: 1rem;
}

.tip-item {
  margin-bottom: 1.5rem;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item h6 {
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.tip-item p {
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .tips-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-status {
    align-self: flex-end;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .create-blog-view {
    background-color: #1a202c;
  }
  
  .page-header {
    background-color: #2d3748 !important;
    border-color: #4a5568;
  }
  
  .tips-content {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .tips-header {
    background-color: #4a5568;
    border-color: #718096;
  }
  
  .tip-item h6 {
    color: #e2e8f0;
  }
  
  .tip-item p {
    color: #a0aec0;
  }
}
</style>
