<template>
  <section class="comment-section">
    <div class="comment-header d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">
        <i class="bi bi-chat-dots me-2"></i>
        Comments<span v-if="authStore.isAuthenticated"> ({{ totalComments }})</span>
      </h3>


    </div>

    <!-- Login Prompt -->
    <div v-if="!authStore.isAuthenticated" class="login-prompt alert alert-info d-flex align-items-center">
      <i class="bi bi-info-circle me-2"></i>
      <div class="flex-grow-1">
        <strong>Join the conversation!</strong>
        <a href="#" @click="$emit('show-auth')" class="alert-link ms-1">Login</a>
        to leave a comment and engage with other readers.
      </div>
    </div>

    <!-- Comment Form -->
    <div v-else class="comment-form mb-4">
      <CommentEditor
        :blog-id="blogId"
        :auto-focus="false"
        placeholder="Share your thoughts about this blog post..."
        @submit="handleCommentSubmit"
        @comment-created="handleCommentCreated"
      />
    </div>

    <!-- Comments Content - Only visible to authenticated users -->
    <div v-if="authStore.isAuthenticated">
      <!-- Loading State -->
      <div v-if="loading && totalComments === 0" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading comments...</span>
        </div>
        <p class="text-muted mt-2">Loading comments...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="totalComments === 0 && !loading" class="empty-comments text-center py-5">
        <i class="bi bi-chat-square-text text-muted mb-3" style="font-size: 3rem;"></i>
        <h5 class="text-muted">No comments yet</h5>
        <p class="text-muted">Be the first to share your thoughts!</p>
      </div>

      <!-- Comments List -->
      <div v-else class="comments-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :show-actions="true"
          @edit="handleEditComment"
          @delete="handleDeleteComment"



          @updated="handleCommentUpdated"

        />

        <!-- Load More Comments -->
        <div v-if="hasMoreComments" class="text-center mt-4">
          <button
            class="btn btn-outline-primary"
            @click="loadMoreComments"
            :disabled="loadingMore"
          >
            <span v-if="loadingMore" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-plus-circle me-1"></i>
            Load More Comments
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger d-flex align-items-center">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div class="flex-grow-1">
        <strong>Error loading comments:</strong> {{ error }}
      </div>
      <button class="btn btn-sm btn-outline-danger" @click="loadComments">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Retry
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { commentService } from '../services/comment.js'
import CommentItem from './CommentItem.vue'
import CommentEditor from './CommentEditor.vue'

const props = defineProps({
  blogId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['show-auth', 'comment-added'])

const authStore = useAuthStore()

// State
const comments = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const hasMoreComments = ref(false)

// Computed
const totalComments = computed(() => {
  return Array.isArray(comments.value) ? comments.value.length : 0
})



// Methods
const loadComments = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await commentService.getCommentsByBlog(props.blogId)
    console.log('Comments API response:', response)

    // Handle different response structures
    if (response.data && Array.isArray(response.data.data)) {
      comments.value = response.data.data
    } else if (Array.isArray(response.data)) {
      comments.value = response.data
    } else if (Array.isArray(response)) {
      comments.value = response
    } else {
      comments.value = []
      console.warn('Unexpected comments response structure:', response)
    }

    console.log('Comments loaded:', comments.value.length)
  } catch (err) {
    error.value = 'Failed to load comments'
    console.error('Error loading comments:', err)
    comments.value = [] // Ensure it's always an array
  } finally {
    loading.value = false
  }
}



const loadMoreComments = async () => {
  loadingMore.value = true
  // Implementation for pagination would go here
  loadingMore.value = false
}

const handleCommentSubmit = (commentData) => {
  // Comment submission is handled by CommentEditor
  console.log('Comment submitted:', commentData)
}

const handleCommentCreated = async (newComment) => {
  // Add new comment to the list
  if (!Array.isArray(comments.value)) {
    comments.value = []
  }
  comments.value.unshift(newComment)
  emit('comment-added', newComment)
}





// Comment handlers
const handleEditComment = async (data) => {
  console.log('Edit comment:', data)
  // The edit functionality is handled within the CommentItem component
  // This handler can be used for additional logic if needed
}

const handleDeleteComment = async (comment) => {
  if (!confirm('Are you sure you want to delete this comment?')) return

  console.log('Attempting to delete comment:', comment.id)

  try {
    const response = await commentService.deleteComment(comment.id)
    console.log('Delete comment response:', response)

    // Remove comment from list
    if (Array.isArray(comments.value)) {
      const index = comments.value.findIndex(c => c.id === comment.id)
      if (index > -1) {
        comments.value.splice(index, 1)
      }
    }

    console.log('Comment deleted successfully!')
  } catch (error) {
    console.error('Error deleting comment:', error)
    console.error('Error details:', error.response?.data)
    error.value = `Failed to delete comment: ${error.response?.data?.message || error.message}`
  }
}



const handleCommentUpdated = (updatedComment) => {
  // Update comment in the list
  if (Array.isArray(comments.value)) {
    const index = comments.value.findIndex(c => c.id === updatedComment.id)
    if (index > -1) {
      comments.value[index] = { ...comments.value[index], ...updatedComment }
    }
  }
}



// Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  console.log('Auth status changed in CommentSection:', isAuthenticated)
  if (isAuthenticated && comments.value.length === 0) {
    loadComments()
  } else if (!isAuthenticated) {
    // Clear comments when user logs out
    comments.value = []
  }
})

onMounted(() => {
  // Only load comments if user is authenticated
  if (authStore.isAuthenticated) {
    loadComments()
  }
})
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
}



.login-prompt {
  border-left: 4px solid #0d6efd;
}

.empty-comments {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  border: 2px dashed #dee2e6;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .comment-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
