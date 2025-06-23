import api from './api.js'

export const commentService = {
  async getCommentsByBlog(blogId, params = {}) {
    const response = await api.get(`/api/blogs/${blogId}/comments`, { params })
    return response.data
  },

  async getComment(id) {
    const response = await api.get(`/api/comments/${id}`)
    return response.data
  },

  async createComment(commentData) {
    console.log('Creating comment with data:', commentData)
    console.log('Auth token present:', !!localStorage.getItem('access_token'))

    const response = await api.post('/api/comments', commentData)
    console.log('Comment created successfully:', response.data)
    return response.data
  },

  async updateComment(id, commentData) {
    const response = await api.put(`/api/comments/${id}`, commentData)
    return response.data
  },

  async deleteComment(id) {
    const response = await api.delete(`/api/comments/${id}`)
    return response.data
  },

  async previewComment(content) {
    const response = await api.post('/api/comments/preview', { content })
    return response.data
  },

  async getPendingComments(params = {}) {
    const response = await api.get('/api/comments/pending', { params })
    return response.data
  },

  async moderateComment(id, action, reason = null) {
    const response = await api.post(`/api/comments/${id}/moderate`, { action, reason })
    return response.data
  },

  async bulkModerateComments(commentIds, action, reason = null) {
    const response = await api.post('/api/comments/bulk-moderate', {
      comment_ids: commentIds,
      action,
      reason
    })
    return response.data
  }
}
