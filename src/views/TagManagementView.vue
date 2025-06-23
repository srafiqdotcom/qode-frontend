<template>
  <div class="tag-management-view">
    <!-- Page Header -->
    <div class="page-header bg-light border-bottom">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3">
          <div>
            <h1 class="h4 mb-1">
              <i class="bi bi-tags me-2"></i>
              Tag Management
            </h1>
            <p class="text-muted mb-0">Organize and manage your blog tags</p>
          </div>
          
          <div class="header-actions">
            <button
              class="btn btn-primary"
              @click="showCreateModal = true"
            >
              <i class="bi bi-plus-circle me-1"></i>
              Create Tag
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section bg-white border-bottom">
      <div class="container py-3">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Search tags..."
                  v-model="searchQuery"
                  @input="debouncedSearch"
                >
                <button
                  v-if="searchQuery"
                  class="btn btn-outline-secondary"
                  @click="clearSearch"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="d-flex justify-content-end gap-2">
              <!-- Sort Options -->
              <div class="dropdown">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-sort-down me-1"></i>
                  {{ getSortLabel() }}
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button
                      class="dropdown-item"
                      :class="{ active: sortBy === 'name' && sortOrder === 'asc' }"
                      @click="setSorting('name', 'asc')"
                    >
                      <i class="bi bi-sort-alpha-down me-2"></i>
                      Name (A-Z)
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      :class="{ active: sortBy === 'name' && sortOrder === 'desc' }"
                      @click="setSorting('name', 'desc')"
                    >
                      <i class="bi bi-sort-alpha-up me-2"></i>
                      Name (Z-A)
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      :class="{ active: sortBy === 'blogs_count' && sortOrder === 'desc' }"
                      @click="setSorting('blogs_count', 'desc')"
                    >
                      <i class="bi bi-sort-numeric-down me-2"></i>
                      Most Used
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      :class="{ active: sortBy === 'blogs_count' && sortOrder === 'asc' }"
                      @click="setSorting('blogs_count', 'asc')"
                    >
                      <i class="bi bi-sort-numeric-up me-2"></i>
                      Least Used
                    </button>
                  </li>
                </ul>
              </div>

              <!-- View Toggle -->
              <div class="btn-group" role="group">
                <button
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="Grid view"
                >
                  <i class="bi bi-grid-3x3-gap"></i>
                </button>
                <button
                  class="btn btn-outline-secondary"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="List view"
                >
                  <i class="bi bi-list"></i>
                </button>
              </div>

              <!-- Refresh Button -->
              <button
                class="btn btn-outline-primary"
                @click="loadTags"
                :disabled="loading"
                title="Refresh"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="container py-4">
        <!-- Loading State -->
        <div v-if="loading && tags.length === 0" class="loading-state text-center py-5">
          <div class="spinner-border text-primary mb-3"></div>
          <p class="text-muted">Loading tags...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error:</strong> {{ error }}
          <button class="btn btn-sm btn-outline-danger ms-2" @click="loadTags">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="tags.length === 0" class="empty-state text-center py-5">
          <i class="bi bi-tags text-muted mb-3" style="font-size: 4rem;"></i>
          <h4 class="text-muted">{{ getEmptyStateTitle() }}</h4>
          <p class="text-muted mb-4">{{ getEmptyStateMessage() }}</p>
          <div class="d-flex gap-2 justify-content-center">
            <button
              v-if="searchQuery"
              class="btn btn-outline-primary"
              @click="clearSearch"
            >
              <i class="bi bi-x-circle me-1"></i>
              Clear Search
            </button>
            <button
              class="btn btn-primary"
              @click="showCreateModal = true"
            >
              <i class="bi bi-plus-circle me-1"></i>
              Create First Tag
            </button>
          </div>
        </div>

        <!-- Tags Display -->
        <div v-else class="tags-display">
          <!-- Stats Bar -->
          <div class="stats-bar d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
            <div class="stats-info">
              <span class="fw-bold">{{ totalTags }}</span> tags total
              <span v-if="searchQuery" class="text-muted ms-2">
                ({{ tags.length }} matching "{{ searchQuery }}")
              </span>
            </div>
            <div class="stats-actions">
              <small class="text-muted">
                Sorted by {{ getSortLabel().toLowerCase() }}
              </small>
            </div>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="tags-grid">
            <div class="row">
              <TagCard
                v-for="tag in tags"
                :key="tag.id"
                :tag="tag"
                class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4"
                @edit="editTag"
                @delete="deleteTag"
                @view-blogs="viewTagBlogs"
              />
            </div>
          </div>

          <!-- List View -->
          <div v-else class="tags-list">
            <TagListItem
              v-for="tag in tags"
              :key="tag.id"
              :tag="tag"
              @edit="editTag"
              @delete="deleteTag"
              @view-blogs="viewTagBlogs"
            />
          </div>

          <!-- Pagination -->
          <div v-if="pagination.last_page > 1" class="pagination-section mt-4">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                  <button class="page-link" @click="changePage(pagination.current_page - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                
                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.current_page }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                  <button class="page-link" @click="changePage(pagination.current_page + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
            
            <div class="text-center text-muted">
              <small>
                Showing {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} to 
                {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of 
                {{ pagination.total }} tags
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Tag Modal -->
    <TagFormModal
      v-if="showCreateModal || showEditModal"
      :tag="editingTag"
      :is-editing="showEditModal"
      @close="closeModals"
      @saved="handleTagSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle text-warning me-2"></i>
              Delete Tag
            </h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the tag <strong>"{{ deletingTag?.name }}"</strong>?</p>
            <div v-if="deletingTag?.blogs_count > 0" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              This tag is used by <strong>{{ deletingTag.blogs_count }}</strong> blog post{{ deletingTag.blogs_count > 1 ? 's' : '' }}.
              Deleting it will remove the tag from all associated posts.
            </div>
            <p class="text-muted mb-0">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmDelete"
              :disabled="deleting"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-trash me-1"></i>
              Delete Tag
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="successMessage" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show">
        <div class="toast-header">
          <i class="bi bi-check-circle-fill text-success me-2"></i>
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close" @click="successMessage = ''"></button>
        </div>
        <div class="toast-body">
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { tagService } from '../services/tag.js'
import TagCard from '../components/TagCard.vue'
import TagListItem from '../components/TagListItem.vue'
import TagFormModal from '../components/TagFormModal.vue'

const router = useRouter()

// State
const tags = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')
const viewMode = ref('grid')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingTag = ref(null)
const deletingTag = ref(null)
const deleting = ref(false)
const successMessage = ref('')
const totalTags = ref(0)

const pagination = reactive({
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1
})

// Debounce timer
let searchTimer = null

// Computed
const visiblePages = computed(() => {
  const pages = []
  const current = pagination.current_page
  const total = pagination.last_page
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const loadTags = async () => {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: searchQuery.value || undefined,
      order_by: sortBy.value,
      order: sortOrder.value
    }

    const response = await tagService.getTags(params)
    
    tags.value = response.data || []
    
    if (response.meta) {
      Object.assign(pagination, response.meta)
      totalTags.value = response.meta.total || 0
    }

  } catch (err) {
    console.error('Error loading tags:', err)
    error.value = 'Failed to load tags'
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.current_page = 1
    loadTags()
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  pagination.current_page = 1
  loadTags()
}

const setSorting = (field, order) => {
  sortBy.value = field
  sortOrder.value = order
  pagination.current_page = 1
  loadTags()
}

const getSortLabel = () => {
  if (sortBy.value === 'name') {
    return sortOrder.value === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)'
  } else {
    return sortOrder.value === 'desc' ? 'Most Used' : 'Least Used'
  }
}

const getEmptyStateTitle = () => {
  return searchQuery.value ? 'No tags found' : 'No tags yet'
}

const getEmptyStateMessage = () => {
  if (searchQuery.value) {
    return `No tags match your search for "${searchQuery.value}". Try different keywords.`
  }
  return 'Create your first tag to start organizing your blog posts.'
}

const editTag = (tag) => {
  editingTag.value = tag
  showEditModal.value = true
}

const deleteTag = (tag) => {
  deletingTag.value = tag
  showDeleteModal.value = true
}

const viewTagBlogs = (tag) => {
  router.push(`/search?tags[]=${encodeURIComponent(tag.name)}`)
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTag.value = null
}

const handleTagSaved = (savedTag) => {
  closeModals()
  
  if (showEditModal.value) {
    // Update existing tag in list
    const index = tags.value.findIndex(t => t.id === savedTag.id)
    if (index > -1) {
      tags.value[index] = savedTag
    }
    successMessage.value = 'Tag updated successfully!'
  } else {
    // Add new tag to list
    tags.value.unshift(savedTag)
    totalTags.value++
    successMessage.value = 'Tag created successfully!'
  }
  
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const confirmDelete = async () => {
  if (!deletingTag.value) return

  deleting.value = true

  try {
    await tagService.deleteTag(deletingTag.value.id)
    
    // Remove from list
    const index = tags.value.findIndex(t => t.id === deletingTag.value.id)
    if (index > -1) {
      tags.value.splice(index, 1)
      totalTags.value--
    }

    showDeleteModal.value = false
    deletingTag.value = null
    successMessage.value = 'Tag deleted successfully!'

    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (err) {
    console.error('Error deleting tag:', err)
    error.value = err.message || 'Failed to delete tag'
  } finally {
    deleting.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    loadTags()
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-management-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 1020;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filters-section {
  position: sticky;
  top: 76px;
  z-index: 1010;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-box .input-group {
  max-width: 400px;
}

.btn-group .btn.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.stats-bar {
  border: 1px solid #dee2e6;
}

.loading-state,
.error-state,
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.toast-container {
  z-index: 1055;
}

.toast {
  min-width: 300px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    align-self: flex-end;
  }
  
  .filters-section .row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-box .input-group {
    max-width: none;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tag-management-view {
    background-color: #1a202c;
  }
  
  .page-header,
  .filters-section {
    background-color: #2d3748 !important;
    border-color: #4a5568;
  }
  
  .stats-bar {
    background-color: #4a5568 !important;
    border-color: #718096;
    color: #e2e8f0;
  }
}
</style>
