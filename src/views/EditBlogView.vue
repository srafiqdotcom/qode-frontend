<template>
  <div class="edit-blog-view">
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
              <h1 class="h4 mb-0">Edit Blog Post</h1>
              <small class="text-muted">Update your content and settings</small>
            </div>
          </div>
          
          <div class="header-actions d-flex gap-2">
            <span v-if="autoSaveStatus" class="badge bg-success">
              <i class="bi bi-check-circle me-1"></i>
              {{ autoSaveStatus }}
            </span>
            
            <RouterLink 
              v-if="blogId" 
              :to="`/blog/${blogId}`" 
              class="btn btn-outline-primary btn-sm"
            >
              <i class="bi bi-eye me-1"></i>
              View Post
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading blog...</span>
          </div>
          <p class="text-muted">Loading blog post...</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="container py-5">
        <div class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-3"></i>
          <div class="flex-grow-1">
            <h5 class="alert-heading">Error Loading Blog</h5>
            <p class="mb-0">{{ error }}</p>
          </div>
          <button class="btn btn-outline-danger" @click="loadBlog">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <BlogEditor
        :blog-id="blogId"
        @blog-updated="handleBlogUpdated"
        @blog-deleted="handleBlogDeleted"
      />
    </div>

    <!-- Update Success Modal -->
    <div v-if="showUpdateModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 text-center">
            <div class="w-100">
              <div class="success-icon mb-3">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
              </div>
              <h4 class="modal-title">Blog Updated Successfully!</h4>
            </div>
          </div>
          <div class="modal-body text-center">
            <p class="mb-4">Your changes have been saved. What would you like to do next?</p>
            
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                @click="viewBlog"
              >
                <i class="bi bi-eye me-2"></i>
                View Updated Post
              </button>
              
              <button
                class="btn btn-outline-secondary"
                @click="continueEditing"
              >
                <i class="bi bi-pencil me-2"></i>
                Continue Editing
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 text-center">
            <div class="w-100">
              <div class="delete-icon mb-3">
                <i class="bi bi-trash-fill text-danger" style="font-size: 3rem;"></i>
              </div>
              <h4 class="modal-title">Blog Deleted Successfully</h4>
            </div>
          </div>
          <div class="modal-body text-center">
            <p class="mb-4">Your blog post has been permanently deleted.</p>
            
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                @click="goToDashboard"
              >
                <i class="bi bi-house me-2"></i>
                Back to Dashboard
              </button>
              
              <button
                class="btn btn-outline-primary"
                @click="createNewBlog"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Create New Blog
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revision History Sidebar (Future Enhancement) -->
    <div v-if="showRevisions" class="revisions-sidebar">
      <div class="revisions-content">
        <div class="revisions-header">
          <h6 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            Revision History
          </h6>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="showRevisions = false"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="revisions-body">
          <div class="revision-item">
            <div class="revision-time">2 hours ago</div>
            <div class="revision-description">Updated content and tags</div>
            <button class="btn btn-sm btn-outline-primary">Restore</button>
          </div>
          
          <div class="revision-item">
            <div class="revision-time">1 day ago</div>
            <div class="revision-description">Initial draft created</div>
            <button class="btn btn-sm btn-outline-primary">Restore</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogEditor from '../components/BlogEditor.vue'

const route = useRoute()
const router = useRouter()

// State
const blogId = ref(route.params.id)
const loading = ref(false)
const error = ref(null)
const showUpdateModal = ref(false)
const showDeleteModal = ref(false)
const showRevisions = ref(false)
const autoSaveStatus = ref('')
const updatedBlog = ref(null)

// Methods
const loadBlog = async () => {
  // The BlogEditor component handles loading the blog data
  loading.value = false
  error.value = null
}

const handleBlogUpdated = (blog) => {
  updatedBlog.value = blog
  showUpdateModal.value = true
  
  // Show auto-save status
  autoSaveStatus.value = 'Saved'
  setTimeout(() => {
    autoSaveStatus.value = ''
  }, 3000)
}

const handleBlogDeleted = (deletedBlogId) => {
  showDeleteModal.value = true
}

const viewBlog = () => {
  if (updatedBlog.value) {
    router.push(`/blog/${updatedBlog.value.id}`)
  } else {
    router.push(`/blog/${blogId.value}`)
  }
}

const continueEditing = () => {
  showUpdateModal.value = false
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const createNewBlog = () => {
  router.push('/blog/create')
}

// Auto-save status simulation
let autoSaveInterval = null

onMounted(() => {
  loadBlog()
  
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
</script>

<style scoped>
.edit-blog-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 1020;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.loading-container,
.error-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.main-content {
  padding-bottom: 2rem;
}

.success-icon {
  animation: bounceIn 0.6s ease-out;
}

.delete-icon {
  animation: shake 0.6s ease-out;
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

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.revisions-sidebar {
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

.revisions-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid #dee2e6;
  max-height: 80vh;
  overflow-y: auto;
}

.revisions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0.5rem 0.5rem 0 0;
}

.revisions-body {
  padding: 1rem;
}

.revision-item {
  padding: 1rem;
  border-bottom: 1px solid #f8f9fa;
  margin-bottom: 1rem;
}

.revision-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.revision-time {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.revision-description {
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .revisions-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    align-self: flex-end;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .edit-blog-view {
    background-color: #1a202c;
  }
  
  .page-header {
    background-color: #2d3748 !important;
    border-color: #4a5568;
  }
  
  .revisions-content {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .revisions-header {
    background-color: #4a5568;
    border-color: #718096;
  }
}
</style>
