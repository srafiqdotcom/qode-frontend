<template>
  <div class="container py-4">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Author Dashboard</h1>
          <button class="btn btn-primary" @click="showCreateModal = true">
            Create New Blog
          </button>
        </div>
        
        <div class="row">
          <div class="col-md-8">
            <h3>My Blogs</h3>
            
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="blogs.length === 0" class="text-center py-5">
              <p class="text-muted">You haven't created any blogs yet.</p>
            </div>
            
            <div v-else>
              <div v-for="blog in blogs" :key="blog.id" class="card mb-3">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-8">
                      <h5 class="card-title">{{ blog.title }}</h5>
                      <p class="card-text">{{ blog.excerpt }}</p>
                      <small class="text-muted">
                        Status: <span class="badge" :class="getStatusClass(blog.status)">{{ blog.status }}</span>
                        • Created: {{ new Date(blog.created_at).toLocaleDateString() }}
                      </small>
                    </div>
                    <div class="col-md-4 text-end">
                      <div class="btn-group-vertical">
                        <RouterLink 
                          :to="{ name: 'blog-detail', params: { id: blog.id } }" 
                          class="btn btn-sm btn-outline-primary"
                        >
                          View
                        </RouterLink>
                        <RouterLink
                          :to="{ name: 'edit-blog', params: { id: blog.id } }"
                          class="btn btn-sm btn-outline-secondary"
                        >
                          Edit
                        </RouterLink>
                        <button
                          v-if="blog.status === 'draft'"
                          class="btn btn-sm btn-success"
                          @click="publishBlog(blog.id)"
                        >
                          Publish
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="deleteBlog(blog.id)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <h3>Quick Stats</h3>
            <div class="card">
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6">
                    <h4>{{ blogs.length }}</h4>
                    <small class="text-muted">Total Blogs</small>
                  </div>
                  <div class="col-6">
                    <h4>{{ publishedCount }}</h4>
                    <small class="text-muted">Published</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <CreateBlogModal v-if="showCreateModal" @close="showCreateModal = false" @created="loadBlogs" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { blogService } from '../services/blog.js'
import CreateBlogModal from '../components/CreateBlogModal.vue'

const blogs = ref([])
const loading = ref(false)
const showCreateModal = ref(false)

const publishedCount = computed(() => {
  return blogs.value.filter(blog => blog.status === 'published').length
})

const getStatusClass = (status) => {
  switch (status) {
    case 'published': return 'bg-success'
    case 'draft': return 'bg-secondary'
    case 'scheduled': return 'bg-warning'
    default: return 'bg-secondary'
  }
}

const loadBlogs = async () => {
  loading.value = true
  
  try {
    const response = await blogService.getBlogs({ per_page: 50 })
    blogs.value = response.data || []
  } catch (err) {
    console.error('Error loading blogs:', err)
  } finally {
    loading.value = false
  }
}

const publishBlog = async (blogId) => {
  try {
    await blogService.publishBlog(blogId)
    await loadBlogs()
  } catch (err) {
    console.error('Error publishing blog:', err)
  }
}

const deleteBlog = async (blogId) => {
  if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
    return
  }

  console.log('Attempting to delete blog:', blogId)

  try {
    const response = await blogService.deleteBlog(blogId)
    console.log('Delete response:', response)
    await loadBlogs() // Reload the blogs list
    alert('Blog deleted successfully!')
  } catch (err) {
    console.error('Error deleting blog:', err)
    console.error('Error details:', err.response?.data)
    alert(`Failed to delete blog: ${err.response?.data?.message || err.message}`)
  }
}

onMounted(() => {
  loadBlogs()
})
</script>
