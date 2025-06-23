import api from './api.js'

export const blogService = {
  async getBlogs(params = {}) {
    const response = await api.get('/api/blogs', { params })

    // Transform the real API response to match our expected structure
    const paginationData = response.data.data
    return {
      data: paginationData.data, // The actual blog posts array
      meta: {
        current_page: paginationData.current_page,
        last_page: Math.ceil(paginationData.total / paginationData.per_page),
        per_page: paginationData.per_page,
        total: paginationData.total,
        has_more_pages: paginationData.next_page_url !== null
      }
    }
  },

  async getBlog(id) {
    const response = await api.get(`/api/blogs/${id}`)
    return response.data
  },

  async searchBlogs(params = {}) {
    console.log('blogService.searchBlogs called with params:', params)
    const response = await api.get('/api/blogs/search', { params })
    console.log('blogService.searchBlogs response:', response.data)

    // Transform the search API response to match the expected structure
    const searchData = response.data
    if (searchData && searchData.data) {
      return {
        data: searchData.data.data || searchData.data, // Handle both nested and direct data
        meta: {
          current_page: searchData.data.current_page || 1,
          last_page: searchData.data.last_page || 1,
          per_page: searchData.data.per_page || params.per_page || 12,
          total: searchData.data.total || (Array.isArray(searchData.data.data) ? searchData.data.data.length : 0),
          has_more_pages: searchData.data.next_page_url !== null
        }
      }
    }

    return response.data
  },



  async advancedSearch(params = {}) {
    const response = await api.get('/api/blogs/search/advanced', { params })
    return response.data
  },

  async getBlogsByTag(tag, params = {}) {
    const response = await api.get(`/api/blogs/tag/${tag}`, { params })
    return response.data
  },

  async getBlogsByAuthor(authorId, params = {}) {
    const response = await api.get(`/api/blogs/author/${authorId}`, { params })
    return response.data
  },

  async createBlog(blogData) {
    const response = await api.post('/api/blogs', blogData)
    return response.data
  },

  async updateBlog(id, blogData) {
    const response = await api.put(`/api/blogs/${id}`, blogData)
    return response.data
  },

  async deleteBlog(id) {
    const response = await api.delete(`/api/blogs/${id}`)
    return response.data
  },

  async publishBlog(id) {
    const response = await api.post(`/api/blogs/${id}/publish`)
    return response.data
  },

  async scheduleBlog(id, scheduledAt) {
    const response = await api.post(`/api/blogs/${id}/schedule`, {
      scheduled_at: scheduledAt
    })
    return response.data
  },

  async draftBlog(id) {
    const response = await api.post(`/api/blogs/${id}/draft`)
    return response.data
  },

  async uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
