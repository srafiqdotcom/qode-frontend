<template>
  <div class="col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-2-4 mb-4">
    <div class="card h-100 blog-card" :class="{ 'loading': isLoading }">
      <div class="position-relative">
        <img
          v-if="blogImage"
          :src="blogImage"
          class="card-img-top"
          :alt="blog.image_alt || blog.title"
          @load="onImageLoad"
          @error="onImageError"
        >
        <div v-else class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
          <i class="bi bi-image text-muted" style="font-size: 3rem;"></i>
        </div>

        <div v-if="blog.status && blog.status !== 'published'" class="position-absolute top-0 end-0 m-2">
          <span class="badge" :class="getStatusBadgeClass(blog.status)">
            {{ blog.status }}
          </span>
        </div>
      </div>

      <div class="card-body d-flex flex-column">
        <div class="mb-2">
          <h5 class="card-title mb-2 line-clamp-2">{{ blog.title }}</h5>
          <p class="card-text text-muted line-clamp-3">{{ blogExcerpt }}</p>
        </div>

        <div v-if="blogTags && blogTags.length" class="mb-3">
          <span
            v-for="tag in blogTags.slice(0, 3)"
            :key="tag.id || tag.name || tag"
            class="badge bg-secondary me-1 mb-1"
            style="font-size: 0.7rem;"
          >
            {{ tag.name || tag }}
          </span>
          <span v-if="blogTags.length > 3" class="text-muted small">
            +{{ blogTags.length - 3 }} more
          </span>
        </div>

        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted d-flex align-items-center">
              <i class="bi bi-calendar3 me-1"></i>
              {{ formatDate(blog.created_at || blog.published_at) }}
            </small>
            <small class="text-muted d-flex align-items-center">
              <i class="bi bi-chat-dots me-1"></i>
              {{ blog.comments_count || 0 }}
            </small>
          </div>

          <div v-if="blog.author" class="d-flex align-items-center mb-2">
            <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                 style="width: 24px; height: 24px;">
              <i class="bi bi-person-fill text-white" style="font-size: 0.8rem;"></i>
            </div>
            <small class="text-muted">{{ blog.author.name }}</small>
          </div>

          <div class="d-flex gap-2">
            <RouterLink
              :to="{ name: 'blog-detail', params: { id: blog.id } }"
              class="btn btn-primary btn-sm flex-grow-1"
            >
              <i class="bi bi-book-open me-1"></i>
              Read More
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  blog: {
    type: Object,
    required: true
  }
})

const isLoading = ref(true)

// Computed properties to handle different API response structures
const blogImage = computed(() => {
  // Handle both image and image_path fields
  return props.blog.image || props.blog.image_path || null
})

const blogTags = computed(() => {
  // Handle both tags (array of objects) and keywords (array of strings)
  if (props.blog.tags && Array.isArray(props.blog.tags)) {
    return props.blog.tags
  }
  if (props.blog.keywords && Array.isArray(props.blog.keywords)) {
    return props.blog.keywords.map(keyword => ({ name: keyword }))
  }
  return []
})

const blogExcerpt = computed(() => {
  // Handle both excerpt and description fields
  let text = props.blog.excerpt || props.blog.description || ''

  // If it's markdown content, extract the first paragraph
  if (text.includes('#') || text.includes('```')) {
    // Remove markdown headers
    text = text.replace(/^#+\s*/gm, '')
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '')
    // Get first paragraph
    text = text.split('\n\n')[0]
  }

  // Limit to reasonable length
  if (text.length > 150) {
    text = text.substring(0, 150) + '...'
  }

  return text.trim()
})

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`

    return date.toLocaleDateString()
  } catch (error) {
    return 'Invalid date'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'draft': return 'bg-secondary'
    case 'scheduled': return 'bg-warning text-dark'
    case 'published': return 'bg-success'
    default: return 'bg-secondary'
  }
}

const onImageLoad = () => {
  isLoading.value = false
}

const onImageError = (event) => {
  isLoading.value = false
  event.target.style.display = 'none'
}


</script>

<style scoped>
.blog-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid rgba(0,0,0,0.125);
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.blog-card.loading {
  opacity: 0.8;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 4.2em;
}

/* Custom 5-column layout for ultra-wide screens */
.col-xxl-2-4 {
  flex: 0 0 auto;
}

@media (min-width: 1400px) {
  .col-xxl-2-4 {
    width: 20%; /* 5 columns = 20% each */
  }
}

/* Ensure cards don't get too wide on very large screens */
@media (min-width: 1400px) {
  .blog-card {
    max-width: 350px;
    margin: 0 auto 1.5rem auto;
  }
}

/* Improve card spacing on extra large screens */
@media (min-width: 1600px) {
  .blog-card {
    max-width: 320px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .blog-card {
    margin-bottom: 1rem;
  }
}


</style>
