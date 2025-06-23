<template>
  <div class="comment-item" :class="{ 'reply': isReply }">
    <div class="d-flex">
      <!-- User Avatar -->
      <div class="flex-shrink-0 me-3">
        <div class="comment-avatar">
          <img
            v-if="comment.user?.avatar"
            :src="comment.user.avatar"
            :alt="comment.user.name"
            class="rounded-circle"
          >
          <div v-else class="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center">
            <i class="bi bi-person-fill"></i>
          </div>
        </div>
      </div>

      <!-- Comment Content -->
      <div class="flex-grow-1">
        <div class="comment-header d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="comment-author mb-1">{{ comment.user?.name || 'Anonymous' }}</h6>
            <small class="text-muted d-flex align-items-center">
              <i class="bi bi-clock me-1"></i>
              {{ formatDate(comment.created_at) }}
              <span v-if="comment.updated_at !== comment.created_at" class="ms-2">
                <i class="bi bi-pencil-square me-1"></i>
                edited
              </span>
            </small>
          </div>

          <!-- Comment Actions -->
          <div class="comment-actions" v-if="showActions">
            <div class="dropdown">
              <button
                class="btn btn-sm btn-outline-secondary dropdown-toggle text-white"
                type="button"
                :id="`comment-actions-${comment.id}`"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li v-if="canEdit">
                  <button class="dropdown-item" @click="startEdit">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </button>
                </li>
                <li v-if="canDelete">
                  <button class="dropdown-item text-danger" @click="$emit('delete', comment)">
                    <i class="bi bi-trash me-2"></i>Delete
                  </button>
                </li>

              </ul>
            </div>
          </div>
        </div>

        <!-- Comment Content -->
        <div class="comment-content mb-3">
          <div v-if="isEditing" class="edit-form">
            <CommentEditor
              :blog-id="comment.blog_id"
              :comment="comment"
              :is-editing="true"
              :auto-focus="true"
              :show-quick-actions="false"
              :rows="4"
              @submit="handleEditSubmit"
              @cancel="cancelEdit"
              @comment-updated="handleCommentUpdated"
            />
          </div>
          <div v-else class="comment-text" v-html="formattedContent"></div>
        </div>

        <!-- Comment Footer -->
        <div class="comment-footer d-flex align-items-center gap-3">



        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import CommentEditor from './CommentEditor.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'delete', 'reply', 'updated', 'replied'])

const authStore = useAuthStore()

// Edit state
const isEditing = ref(false)





// Computed properties
const canEdit = computed(() => {
  return authStore.isAuthenticated &&
         authStore.user?.id === props.comment.user?.id
})

const canDelete = computed(() => {
  return authStore.isAuthenticated &&
         (authStore.user?.id === props.comment.user?.id || authStore.isAuthor)
})



const formattedContent = computed(() => {
  // Simple markdown-like formatting
  let content = props.comment.content || ''

  // Convert line breaks to <br>
  content = content.replace(/\n/g, '<br>')

  // Bold text **text**
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic text *text*
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Code `code`
  content = content.replace(/`(.*?)`/g, '<code>$1</code>')

  return content
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString()
  } catch (error) {
    return 'Invalid date'
  }
}





const startEdit = () => {
  isEditing.value = true
}

const handleEditSubmit = (updatedComment) => {
  emit('edit', {
    comment: props.comment,
    updatedComment
  })
}

const handleCommentUpdated = (updatedComment) => {
  isEditing.value = false
  emit('updated', updatedComment)
}

const cancelEdit = () => {
  isEditing.value = false
}
</script>

<style scoped>
.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-item.reply {
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 3px solid #e9ecef;
}

.comment-avatar img,
.avatar-placeholder {
  width: 40px;
  height: 40px;
}



.avatar-placeholder {
  background-color: #6c757d;
  color: white;
  font-size: 1.2rem;
}

.reply-avatar .avatar-placeholder {
  font-size: 1rem;
}

.comment-author {
  font-weight: 600;
  color: #FFFFFF;
}

.comment-content {
  line-height: 1.6;
}

.comment-text {
  color: #FFFFFF;
}

.comment-action-btn {
  border: none;
  background: none;
  color: #FFFFFF;
  transition: color 0.2s ease;
}

.comment-action-btn:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.comment-action-btn.active {
  color: #dc3545;
}

.edit-form textarea {
  resize: vertical;
  min-height: 80px;
}



@media (max-width: 768px) {
  .comment-item.reply {
    margin-left: 1rem;
  }

  .comment-avatar img,
  .avatar-placeholder {
    width: 32px;
    height: 32px;
  }

  .reply-avatar img,
  .reply-avatar .avatar-placeholder {
    width: 28px;
    height: 28px;
  }
}
</style>
