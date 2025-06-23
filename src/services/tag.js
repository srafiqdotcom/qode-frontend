import api from './api.js'

export const tagService = {
  async getTags(params = {}) {
    const response = await api.get('/api/tags', { params })
    return response.data
  },

  async getTag(id) {
    const response = await api.get(`/api/tags/${id}`)
    return response.data
  },

  async createTag(tagData) {
    const response = await api.post('/api/tags', tagData)
    return response.data
  },

  async updateTag(id, tagData) {
    const response = await api.put(`/api/tags/${id}`, tagData)
    return response.data
  },

  async deleteTag(id) {
    const response = await api.delete(`/api/tags/${id}`)
    return response.data
  }
}
