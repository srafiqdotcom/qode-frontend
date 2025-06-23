<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create New Blog</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.title"
                required
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Excerpt</label>
              <textarea 
                class="form-control" 
                rows="3"
                v-model="form.excerpt"
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Content</label>
              <textarea 
                class="form-control" 
                rows="8"
                v-model="form.description"
                placeholder="Write your blog content in markdown..."
                required
              ></textarea>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Keywords (comma separated)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="keywordsText"
                    placeholder="laravel, php, tutorial"
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="tagsText"
                    placeholder="laravel, php"
                  >
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Meta Title</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.meta_title"
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="form.status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Meta Description</label>
              <textarea 
                class="form-control" 
                rows="2"
                v-model="form.meta_description"
              ></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Create Blog
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { blogService } from '../services/blog.js'

const emit = defineEmits(['close', 'created'])

const submitting = ref(false)
const keywordsText = ref('')
const tagsText = ref('')

const form = reactive({
  title: '',
  excerpt: '',
  description: '',
  meta_title: '',
  meta_description: '',
  status: 'draft'
})

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    const blogData = {
      ...form,
      keywords: keywordsText.value ? keywordsText.value.split(',').map(k => k.trim()) : [],
      tags: tagsText.value ? tagsText.value.split(',').map(t => t.trim()) : []
    }
    
    await blogService.createBlog(blogData)
    emit('created')
    emit('close')
  } catch (err) {
    console.error('Error creating blog:', err)
  } finally {
    submitting.value = false
  }
}
</script>
