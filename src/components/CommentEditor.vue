<template>
  <div class="comment-editor" :class="{ 'editing': isEditing, 'replying': isReply }">
    <div class="editor-header d-flex align-items-center mb-3">
      <div class="user-avatar me-3">
        <div class="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center">
          <i class="bi bi-person-fill"></i>
        </div>
      </div>
      <div class="flex-grow-1">
        <h6 class="mb-1">
          <i class="bi" :class="isEditing ? 'bi-pencil-square' : isReply ? 'bi-reply' : 'bi-chat-dots'"></i>
          {{ getEditorTitle() }}
        </h6>
        <small class="text-muted">{{ getEditorSubtitle() }}</small>
      </div>
      <button
        v-if="showCloseButton"
        type="button"
        class="btn btn-sm btn-outline-secondary"
        @click="handleCancel"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div class="editor-body">
      <MarkdownEditor
        ref="markdownEditor"
        v-model="content"
        :placeholder="placeholder"
        :rows="rows"
        :max-length="maxLength"
        :show-char-count="showCharCount"
        :show-footer="showFooter"

        @save="handleSubmit"
      />



      <!-- Editor Actions -->
      <div class="editor-actions d-flex justify-content-between align-items-center mt-3">
        <div class="action-info">
          <small class="text-muted">
            <i class="bi bi-info-circle me-1"></i>
            {{ getActionInfo() }}
          </small>
        </div>

        <div class="action-buttons d-flex gap-2">
          <button
            v-if="showCancelButton"
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="submitting"
          >
            Cancel
          </button>



          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="!content.trim() || submitting"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else :class="getSubmitIcon()" class="me-1"></i>
            {{ getSubmitText() }}
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="alert alert-danger mt-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success mt-3">
        <i class="bi bi-check-circle-fill me-2"></i>
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { commentService } from '../services/comment.js'
import MarkdownEditor from './MarkdownEditor.vue'

const props = defineProps({
  blogId: {
    type: [String, Number],
    required: true
  },
  comment: {
    type: Object,
    default: null
  },
  parentComment: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isReply: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Write your comment in markdown...'
  },
  rows: {
    type: Number,
    default: 6
  },
  maxLength: {
    type: Number,
    default: 5000
  },
  showCharCount: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },


  autoFocus: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'submit', 'cancel',
  'comment-created', 'comment-updated', 'comment-replied'
])

const authStore = useAuthStore()

// State
const content = ref('')
const submitting = ref(false)
const error = ref(null)
const successMessage = ref(null)
const markdownEditor = ref(null)



// Computed
const showCloseButton = computed(() => props.isEditing || props.isReply)
const showCancelButton = computed(() => props.isEditing || props.isReply)

const getEditorTitle = () => {
  if (props.isEditing) return 'Edit Comment'
  if (props.isReply) return 'Reply to Comment'
  return 'Write a Comment'
}

const getEditorSubtitle = () => {
  if (props.isEditing) return 'Update your comment'
  if (props.isReply) return `Replying to ${props.parentComment?.user?.name || 'comment'}`
  return 'Share your thoughts with the community'
}

const getSubmitText = () => {
  if (props.isEditing) return 'Update Comment'
  if (props.isReply) return 'Post Reply'
  return 'Post Comment'
}

const getSubmitIcon = () => {
  if (props.isEditing) return 'bi-check-lg'
  if (props.isReply) return 'bi-reply'
  return 'bi-send'
}

const getActionInfo = () => {
  if (props.isEditing) return 'Changes will be visible immediately after updating'
  if (props.isReply) return 'Your reply will be posted as a response to this comment'
  return 'Your comment will be posted publicly on this blog'
}

// Methods
const handleSubmit = async () => {
  if (!content.value.trim()) return

  // Check authentication before submitting
  if (!authStore.isAuthenticated) {
    error.value = 'You must be logged in to post a comment. Please log in and try again.'
    return
  }

  submitting.value = true
  error.value = null
  successMessage.value = null

  try {
    let response

    if (props.isEditing) {
      // Update existing comment
      response = await commentService.updateComment(props.comment.id, {
        content: content.value,
        blog_id: props.blogId
      })
      successMessage.value = 'Comment updated successfully!'
      emit('comment-updated', response.data)
    } else {
      // Create new comment or reply
      response = await commentService.createComment({
        content: content.value,
        blog_id: props.blogId,
        parent_id: props.parentComment?.id || null
      })
      
      if (props.isReply) {
        successMessage.value = 'Reply posted successfully!'
        emit('comment-replied', response.data)
      } else {
        successMessage.value = 'Comment posted successfully!'
        emit('comment-created', response.data)
      }
    }

    emit('submit', response.data)

    // Clear form if not editing
    if (!props.isEditing) {
      content.value = ''
    }

    // Auto-close after success
    setTimeout(() => {
      if (props.isEditing || props.isReply) {
        handleCancel()
      }
    }, 1500)

  } catch (err) {
    console.error('Comment submission error:', err)

    if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please log in again to post comments.'
    } else {
      error.value = err.response?.data?.message || 'Failed to submit comment. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  if (props.isEditing) {
    content.value = props.comment?.content || ''
  } else {
    content.value = ''
  }
  
  error.value = null
  successMessage.value = null
  emit('cancel')
}





const focusEditor = () => {
  if (markdownEditor.value) {
    markdownEditor.value.focus()
  }
}

// Initialize content for editing
const initializeContent = () => {
  if (props.isEditing && props.comment) {
    content.value = props.comment.content || ''
  }
}

// Watch for prop changes
watch(() => props.comment, () => {
  initializeContent()
}, { immediate: true })

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated) {
    error.value = 'You have been logged out. Please log in again to continue.'
    submitting.value = false
  }
})

onMounted(() => {
  initializeContent()
  
  if (props.autoFocus) {
    setTimeout(() => {
      focusEditor()
    }, 100)
  }
})

// Expose methods for parent components
defineExpose({
  focus: focusEditor,
  clear: () => { content.value = '' },
  setContent: (newContent) => { content.value = newContent },
  getContent: () => content.value
})
</script>

<style scoped>
.comment-editor {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.comment-editor.editing {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}

.comment-editor.replying {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  margin-left: 2rem;
  position: relative;
}

.comment-editor.replying::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 1.5rem;
  height: 2px;
  background-color: #0d6efd;
}

.comment-editor.replying::after {
  content: '';
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 2px;
  height: 1.5rem;
  background-color: #0d6efd;
}

.user-avatar .avatar-placeholder {
  width: 40px;
  height: 40px;
  background-color: #6c757d;
  color: white;
  font-size: 1.2rem;
}

.editor-header h6 {
  color: #495057;
  font-weight: 600;
}

.quick-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
}

.quick-actions .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

.editor-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
}

.action-info {
  flex-grow: 1;
}

.action-buttons {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .comment-editor {
    padding: 1rem;
  }
  
  .comment-editor.replying {
    margin-left: 1rem;
  }
  
  .comment-editor.replying::before {
    left: -1rem;
    width: 0.75rem;
  }
  
  .comment-editor.replying::after {
    left: -1rem;
    height: 1rem;
  }
  
  .editor-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-buttons .btn {
    flex: 1;
  }
  
  .quick-actions .d-flex {
    justify-content: center;
  }
  
  .user-avatar .avatar-placeholder {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}

/* Animation for success/error messages */
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
