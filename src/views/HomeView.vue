<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { blogService } from '../services/blog.js'
import { tagService } from '../services/tag.js'
import { useInfiniteScroll } from '../composables/useInfiniteScroll.js'
import BlogCard from '../components/BlogCard.vue'
import BlogCardSkeleton from '../components/BlogCardSkeleton.vue'
import NotificationToast from '../components/NotificationToast.vue'


const route = useRoute()
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('info')
const observerTarget = ref(null)

// Search functionality
const searchQuery = ref('')
const selectedTag = ref('')
const availableTags = ref([])
const allBlogs = ref([])
const isSearching = ref(false)

// Infinite scroll setup
const {
  items: blogs,
  isLoading,
  hasMore,
  error,
  totalItems,
  loadInitial,
  loadMore,
  refresh,
  setObserverTarget,
  isEmpty,
  isFirstLoad
} = useInfiniteScroll(
  async (params) => {
    const hasTextSearch = searchQuery.value.trim()
    const hasTagSearch = selectedTag.value

    console.log('Search params:', { hasTextSearch, hasTagSearch, searchQuery: searchQuery.value, selectedTag: selectedTag.value })

    if (hasTextSearch || hasTagSearch) {
      const searchParams = { ...params }

      if (hasTextSearch) {
        searchParams.query = searchQuery.value.trim()
      }

      if (hasTagSearch) {
        searchParams.tags = [selectedTag.value]
      }

      console.log('Calling searchBlogs with params:', searchParams)
      const result = await blogService.searchBlogs(searchParams)
      console.log('Search result:', result)
      return result
    }

    console.log('Calling getBlogs with params:', params)
    const result = await blogService.getBlogs(params)
    console.log('GetBlogs result:', result)
    return result
  },
  {
    itemsPerPage: 12,
    threshold: 0.1,
    rootMargin: '200px'
  }
)

// Computed properties
const skeletonCount = computed(() => {
  if (isFirstLoad()) return 6
  return 3
})

const showLoadMoreButton = computed(() => {
  return hasMore.value && !isLoading.value && blogs.value.length > 0
})

const showEmptyState = computed(() => {
  return isEmpty() && !error.value
})

// Safe tags list for template (already filtered in loadTags)
const safeTags = computed(() => {
  return Array.isArray(availableTags.value) ? availableTags.value : []
})

// Methods
const handleRefresh = async () => {
  await refresh()
}

const handleLoadMore = async () => {
  await loadMore()
}

const handleSearch = async () => {
  console.log('handleSearch called with:', { searchQuery: searchQuery.value, selectedTag: selectedTag.value })
  isSearching.value = true
  try {
    // Update URL with search parameters
    const newQuery = { ...route.query }

    if (searchQuery.value.trim()) {
      newQuery.search = searchQuery.value.trim()
    } else {
      delete newQuery.search
    }

    if (selectedTag.value) {
      newQuery.tag = selectedTag.value
    } else {
      delete newQuery.tag
    }

    console.log('Updating URL with query:', newQuery)
    // Update URL without navigation
    window.history.replaceState({}, '', `${window.location.pathname}${Object.keys(newQuery).length ? '?' + new URLSearchParams(newQuery).toString() : ''}`)

    console.log('Calling refresh...')
    await refresh() // This will trigger the search in the infinite scroll callback
    console.log('Refresh completed')

    // Force a UI update
    await nextTick()
    console.log('Current blogs count after search:', blogs.value.length)
  } finally {
    isSearching.value = false
  }
}

const clearSearch = async () => {
  searchQuery.value = ''
  selectedTag.value = ''
  await handleSearch()
}

const showRouterMessage = () => {
  if (route.query.message) {
    notificationMessage.value = route.query.message
    notificationType.value = route.query.type || 'info'
    showNotification.value = true

    // Clear the query parameter
    const newQuery = { ...route.query }
    delete newQuery.message
    delete newQuery.type

    // Update URL without the message
    window.history.replaceState({}, '', window.location.pathname)
  }
}

// Load available tags
const loadTags = async () => {
  try {
    const response = await tagService.getTags({ per_page: 50 })
    console.log('Tags API response:', response)

    // Handle Laravel pagination response structure
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      availableTags.value = response.data.data.filter(tag => tag && tag.id && tag.name)
      console.log('Loaded tags:', availableTags.value.length, 'tags')
    } else {
      console.warn('Unexpected tags response structure:', response)
      availableTags.value = []
    }
  } catch (error) {
    console.error('Error loading tags:', error)
    availableTags.value = [] // Ensure it's always an array
  }
}

onMounted(async () => {
  showRouterMessage()

  // Check for search parameters in URL
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.tag) {
    selectedTag.value = route.query.tag
  }

  // Load tags for the dropdown
  await loadTags()

  await loadInitial()

  // Re-enable infinite scroll with proper delay
  await nextTick()
  setTimeout(() => {
    if (observerTarget.value && blogs.value.length > 0 && hasMore.value) {
      setObserverTarget(observerTarget.value)
    }
  }, 3000) // 3 second delay to ensure content is rendered
})
</script>

<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-12">
        <!-- Header Section -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="mb-1">{{ (searchQuery || selectedTag) ? 'Search Results' : 'Latest Blogs' }}</h1>
            <p class="text-white mb-0" v-if="totalItems > 0">
              Showing {{ blogs.length }} of {{ totalItems }} blogs
              <span v-if="searchQuery"> for "{{ searchQuery }}"</span>
              <span v-if="selectedTag"> in tag "{{ selectedTag }}"</span>
            </p>
          </div>
          <button
            class="btn btn-outline-primary btn-sm"
            @click="handleRefresh"
            :disabled="isLoading"
            title="Refresh blogs"
          >
            <i class="bi bi-arrow-clockwise" :class="{ 'spin': isLoading }"></i>
            Refresh
          </button>
        </div>

        <!-- Search Section -->
        <div class="row mb-4">
          <div class="col-md-10 col-lg-8 mx-auto">
            <div class="row g-2">
              <!-- Text Search -->
              <div class="col-md-8">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search by title, keywords, or description..."
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    :disabled="isLoading"
                  >
                  <button
                    v-if="searchQuery || selectedTag"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="clearSearch"
                    :disabled="isLoading"
                    title="Clear search"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <!-- Tag Filter -->
              <div class="col-md-4">
                <select
                  class="form-select"
                  v-model="selectedTag"
                  :disabled="isLoading"
                >
                  <option value="">All Tags</option>
                  <option
                    v-for="tag in safeTags"
                    :key="tag.id"
                    :value="tag.name"
                  >
                    {{ tag.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Search Button -->
            <div class="text-center mt-2">
              <button
                class="btn btn-primary"
                type="button"
                @click="handleSearch"
                :disabled="isLoading || isSearching"
              >
                <i class="bi bi-search me-1"></i>
                {{ isSearching ? 'Searching...' : 'Search' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="alert alert-danger d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>Error loading blogs:</strong> {{ error }}
            <button class="btn btn-link btn-sm p-0 ms-2" @click="handleRefresh">
              Try again
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="showEmptyState" class="text-center py-5">
          <i class="bi bi-journal-x mb-3 text-white" style="font-size: 4rem;"></i>
          <h3 class="text-white">
            {{ (searchQuery || selectedTag) ? 'No blogs found' : 'No blogs available' }}
          </h3>
          <p class="text-white">
            {{ (searchQuery || selectedTag) ? 'Try adjusting your search criteria or browse all blogs.' : 'Be the first to create a blog post!' }}
          </p>
          <button
            v-if="searchQuery || selectedTag"
            class="btn btn-outline-light btn-sm mt-2"
            @click="clearSearch"
          >
            <i class="bi bi-arrow-left me-1"></i>
            View All Blogs
          </button>
        </div>

        <!-- Debug Info (remove in production) -->
        <div class="alert alert-info mb-3" v-if="searchQuery || selectedTag">
          <small>
            <strong>Debug:</strong>
            Search: "{{ searchQuery }}" |
            Tag: "{{ selectedTag }}" |
            Results: {{ blogs.length }} |
            Loading: {{ isLoading }} |
            Error: {{ error }}
          </small>
        </div>

        <!-- Blog Grid -->
        <div v-if="!error && !showEmptyState" class="row" id="blogs-grid">

          <!-- Actual Blog Cards -->
          <BlogCard
            v-for="blog in blogs"
            :key="`blog-${blog.id}`"
            :blog="blog"
          />

          <!-- Loading Skeletons -->
          <BlogCardSkeleton
            v-for="n in skeletonCount"
            :key="`skeleton-${n}`"
            v-show="isLoading"
          />
        </div>

        <!-- Load More Section -->
        <div class="text-center mt-4" v-if="blogs.length > 0">
          <!-- Intersection Observer Target -->
          <div
            ref="observerTarget"
            class="intersection-target"
            style="height: 20px;"
          ></div>

          <!-- Loading Indicator -->
          <div v-if="isLoading && !isFirstLoad()" class="py-3">
            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
            <span class="text-muted">Loading more blogs...</span>
          </div>

          <!-- Manual Load More Button (fallback) -->
          <button
            v-else-if="showLoadMoreButton"
            class="btn btn-outline-primary"
            @click="handleLoadMore"
          >
            <i class="bi bi-plus-circle me-1"></i>
            Load More Blogs
          </button>

          <!-- End of Results -->
          <div v-else-if="!hasMore && blogs.length > 0" class="text-muted py-3">
            <i class="bi bi-check-circle me-1"></i>
            You've reached the end of all blogs
          </div>
        </div>


      </div>
    </div>
  </div>

  <NotificationToast
    v-if="showNotification"
    :message="notificationMessage"
    :type="notificationType"
    @close="showNotification = false"
  />
</template>

<style scoped>
.intersection-target {
  visibility: hidden;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

#blogs-grid {
  min-height: 400px;
}

/* Smooth transitions for blog cards */
.row > div {
  transition: opacity 0.3s ease-in-out;
}

/* Loading state animations */
@media (prefers-reduced-motion: no-preference) {
  .spinner-border {
    animation-duration: 0.75s;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 15px;
    padding-right: 15px;
  }

  h1 {
    font-size: 1.75rem;
  }
}

/* Better container sizing for large screens */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}

@media (min-width: 1600px) {
  .container {
    max-width: 1500px;
  }
}

/* Ensure proper spacing on mobile */
@media (max-width: 576px) {
  .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
