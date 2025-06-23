<template>
  <div class="blog-detail">
    <!-- Loading State -->
    <div v-if="loading" class="container py-5">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="blog-skeleton">
            <div class="skeleton-title mb-3"></div>
            <div class="skeleton-meta mb-4"></div>
            <div class="skeleton-image mb-4"></div>
            <div class="skeleton-text mb-2"></div>
            <div class="skeleton-text mb-2"></div>
            <div class="skeleton-text mb-4" style="width: 70%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="row">
        <div class="col-lg-8 mx-auto">
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
    </div>

    <!-- Blog Content -->
    <div v-else-if="blog" class="container py-4">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <RouterLink to="/" class="text-decoration-none">
              <i class="bi bi-house-door me-1"></i>
              Home
            </RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ blog.title }}
          </li>
        </ol>
      </nav>

      <div class="row">
        <div class="col-lg-8 mx-auto">
          <!-- Blog Article -->
          <article class="blog-article">
            <!-- Article Header -->
            <header class="article-header mb-4">
              <h1 class="article-title mb-3">{{ blog.title }}</h1>

              <!-- Article Meta -->
              <div class="article-meta d-flex flex-wrap align-items-center gap-3 mb-4">
                <div class="author-info d-flex align-items-center">
                  <div class="author-avatar me-2">
                    <div class="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center">
                      <i class="bi bi-person-fill"></i>
                    </div>
                  </div>
                  <div>
                    <div class="author-name fw-semibold">{{ blog.author?.name || 'Anonymous' }}</div>
                    <small class="text-muted">Author</small>
                  </div>
                </div>

                <div class="article-stats d-flex gap-3">
                  <span class="stat-item">
                    <i class="bi bi-calendar3 me-1"></i>
                    {{ formatDate(blog.created_at || blog.published_at) }}
                  </span>

                </div>
              </div>

              <!-- Article Actions -->
              <div class="article-actions d-flex justify-content-between align-items-center mb-4">
                <div class="social-actions d-flex gap-2">



                </div>


              </div>
            </header>

            <!-- Featured Image -->
            <div v-if="blog.image" class="featured-image mb-4">
              <img
                :src="blog.image"
                class="img-fluid rounded"
                :alt="blog.image_alt || blog.title"
                @error="onImageError"
              >
              <small v-if="blog.image_alt" class="text-muted d-block mt-2 text-center">
                {{ blog.image_alt }}
              </small>
            </div>

            <!-- Article Excerpt -->
            <div v-if="blog.excerpt" class="article-excerpt mb-4">
              <p class="lead text-muted">{{ blog.excerpt }}</p>
            </div>

            <!-- Article Content -->
            <div class="article-content mb-5">
              <div v-html="formattedContent"></div>
            </div>

            <!-- Article Tags -->
            <div v-if="blog.tags && blog.tags.length" class="article-tags mb-4">
              <h6 class="mb-2">
                <i class="bi bi-tags me-1"></i>
                Tags
              </h6>
              <div class="tags-list">
                <RouterLink
                  v-for="tag in blog.tags"
                  :key="tag.id"
                  :to="`/search?tag=${tag.name}`"
                  class="badge bg-secondary text-decoration-none me-2 mb-2"
                >
                  {{ tag.name }}
                </RouterLink>
              </div>
            </div>
          </article>

          <!-- Article Footer -->
          <footer class="article-footer py-4 border-top">
            <div class="row">
              <div class="col-12 text-center">
                <div class="stats-summary text-muted">
                  <small>
                    Published {{ formatDate(blog.created_at) }}
                  </small>
                </div>
              </div>
            </div>
          </footer>

          <!-- Comments Section -->
          <CommentSection
            :blog-id="route.params.id"
            @show-auth="showAuthModal = true"
            @comment-added="onCommentAdded"
          />
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert">
        <div class="toast-header">
          <i class="bi bi-check-circle-fill text-success me-2"></i>
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close" @click="showSuccessToast = false"></button>
        </div>
        <div class="toast-body">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { blogService } from '../services/blog.js'
import { useAuthStore } from '../stores/auth.js'
import AuthModal from '../components/AuthModal.vue'
import CommentSection from '../components/CommentSection.vue'

const route = useRoute()
const authStore = useAuthStore()

// State
const blog = ref(null)
const loading = ref(false)
const error = ref(null)
const showAuthModal = ref(false)



const showSuccessToast = ref(false)
const successMessage = ref('')

// Computed
const formattedContent = computed(() => {
  if (!blog.value?.description) return ''

  let content = blog.value.description

  // Convert markdown-like formatting to HTML
  content = content.replace(/\n/g, '<br>')
  content = content.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  content = content.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  content = content.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
  content = content.replace(/`(.*?)`/g, '<code>$1</code>')
  content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

  // Convert bullet points
  content = content.replace(/^- (.*$)/gm, '<li>$1</li>')
  content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  return content
})

// Methods
const loadBlog = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await blogService.getBlog(route.params.id)
    blog.value = response.data || response


  } catch (err) {
    error.value = 'Failed to load blog post. Please try again.'
    console.error('Error loading blog:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

const formatNumber = (num) => {
  if (!num) return '0'

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}















const showToast = (message) => {
  successMessage.value = message
  showSuccessToast.value = true

  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

const onImageError = (event) => {
  event.target.style.display = 'none'
}

const onCommentAdded = () => {
  showToast('Comment posted successfully!')
}

onMounted(() => {
  loadBlog()
})
</script>

<style scoped>
/* Blog Detail Styles */
.blog-detail {
  min-height: 100vh;
}

/* Loading Skeleton */
.blog-skeleton .skeleton-title {
  height: 48px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.blog-skeleton .skeleton-meta {
  height: 20px;
  width: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.blog-skeleton .skeleton-image {
  height: 300px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.blog-skeleton .skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Article Styles */
.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #FFFFFF;
}

.author-avatar .avatar-placeholder {
  width: 48px;
  height: 48px;
  background-color: #6c757d;
  color: white;
  font-size: 1.5rem;
}

.article-meta .stat-item {
  color: #6c757d;
  font-size: 0.9rem;
}

.article-actions .btn.active {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.featured-image img {
  max-height: 400px;
  width: 100%;
  object-fit: cover;
}

.article-excerpt {
  font-size: 1.1rem;
  line-height: 1.6;
  border-left: 4px solid #0d6efd;
  padding-left: 1rem;
  background-color: #f8f9fa;
  border-radius: 0 0.375rem 0.375rem 0;
  padding: 1rem 1rem 1rem 1.5rem;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #FFFFFF;
}



.article-content h1,
.article-content h2,
.article-content h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.article-content h1 {
  font-size: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.article-content h2 {
  font-size: 1.5rem;
  color: #495057;
}

.article-content h3 {
  font-size: 1.25rem;
  color: #6c757d;
}

.article-content code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
  color: #e83e8c;
}

.article-content pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  border-left: 4px solid #0d6efd;
}

.article-content pre code {
  background: none;
  padding: 0;
  color: #212529;
}

.article-content ul {
  padding-left: 1.5rem;
}

.article-content li {
  margin-bottom: 0.5rem;
}

.tags-list .badge {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
}

.tags-list .badge:hover {
  background-color: #495057 !important;
  transform: translateY(-1px);
}



/* Toast Styles */
.toast-container {
  z-index: 1055;
}

.toast {
  min-width: 300px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 1rem !important;
  }

  .article-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .social-actions,
  .utility-actions {
    width: 100%;
    justify-content: center;
  }

  .article-content {
    font-size: 1rem;
  }




}

@media (max-width: 576px) {
  .author-avatar .avatar-placeholder {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .article-excerpt {
    font-size: 1rem;
    padding: 0.75rem 0.75rem 0.75rem 1rem;
  }

  .featured-image img {
    max-height: 250px;
  }
}
</style>
