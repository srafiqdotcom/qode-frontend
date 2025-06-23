<template>
  <div class="tag-list-item" :style="{ borderLeftColor: tag.color }">
    <div class="tag-content">
      <!-- Tag Info -->
      <div class="tag-info">
        <div class="tag-header d-flex align-items-center gap-2">
          <div class="tag-color-indicator" :style="{ backgroundColor: tag.color }"></div>
          <h6 class="tag-name mb-0">{{ tag.name }}</h6>
          <span class="tag-slug">{{ tag.slug }}</span>
        </div>
        
        <div v-if="tag.description" class="tag-description mt-2">
          <p class="mb-0">{{ tag.description }}</p>
        </div>
      </div>

      <!-- Tag Stats -->
      <div class="tag-stats">
        <div class="stat-group">
          <div class="stat-item">
            <i class="bi bi-file-text text-primary"></i>
            <span class="stat-value">{{ tag.blogs_count || 0 }}</span>
            <span class="stat-label">{{ tag.blogs_count === 1 ? 'Blog' : 'Blogs' }}</span>
          </div>
          
          <div class="stat-item">
            <i class="bi bi-calendar text-muted"></i>
            <span class="stat-value">{{ formatDate(tag.created_at) }}</span>
            <span class="stat-label">Created</span>
          </div>
          
          <div class="stat-item">
            <i class="bi bi-clock text-muted"></i>
            <span class="stat-value">{{ formatDate(tag.updated_at) }}</span>
            <span class="stat-label">Updated</span>
          </div>
        </div>

        <!-- Usage Indicator -->
        <div class="usage-indicator">
          <div class="usage-bar">
            <div 
              class="usage-fill" 
              :style="{ 
                width: getUsagePercentage() + '%',
                backgroundColor: tag.color 
              }"
            ></div>
          </div>
          <small class="usage-text">{{ getUsageText() }}</small>
        </div>
      </div>
    </div>

    <!-- Tag Actions -->
    <div class="tag-actions">
      <div class="action-buttons d-flex gap-2">
        <button
          class="btn btn-sm btn-outline-primary"
          @click="$emit('view-blogs', tag)"
          :disabled="tag.blogs_count === 0"
          title="View blogs with this tag"
        >
          <i class="bi bi-eye me-1"></i>
          <span class="d-none d-md-inline">View</span>
        </button>
        
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="$emit('edit', tag)"
          title="Edit tag"
        >
          <i class="bi bi-pencil me-1"></i>
          <span class="d-none d-md-inline">Edit</span>
        </button>
        
        <div class="dropdown">
          <button
            class="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" @click="$emit('edit', tag)">
                <i class="bi bi-pencil me-2"></i>
                Edit Tag
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="$emit('view-blogs', tag)">
                <i class="bi bi-file-text me-2"></i>
                View Blogs
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="copyTagSlug">
                <i class="bi bi-clipboard me-2"></i>
                Copy Slug
              </button>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item text-danger" @click="$emit('delete', tag)">
                <i class="bi bi-trash me-2"></i>
                Delete Tag
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  tag: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'view-blogs'])

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid'
  }
}

const getUsagePercentage = () => {
  // Calculate usage percentage based on blog count
  // Max of 50 blogs = 100%
  const maxBlogs = 50
  return Math.min((props.tag.blogs_count / maxBlogs) * 100, 100)
}

const getUsageText = () => {
  const count = props.tag.blogs_count || 0
  if (count === 0) return 'Unused'
  if (count === 1) return 'Low usage'
  if (count <= 5) return 'Moderate usage'
  if (count <= 15) return 'High usage'
  return 'Very popular'
}

const copyTagSlug = async () => {
  try {
    await navigator.clipboard.writeText(props.tag.slug)
    // You could show a toast notification here
    console.log('Tag slug copied to clipboard')
  } catch (error) {
    console.error('Failed to copy slug:', error)
  }
}
</script>

<style scoped>
.tag-list-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #dee2e6;
  border-left: 4px solid #6c757d;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.tag-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tag-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-info {
  flex-grow: 1;
}

.tag-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  color: #495057;
  font-weight: 600;
  font-size: 1.1rem;
}

.tag-slug {
  color: #6c757d;
  font-size: 0.85rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}

.tag-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.tag-description p {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.stat-group {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.stat-label {
  color: #6c757d;
  font-size: 0.8rem;
}

.usage-indicator {
  min-width: 120px;
  text-align: right;
}

.usage-bar {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.usage-text {
  color: #6c757d;
  font-size: 0.75rem;
}

.tag-actions {
  flex-shrink: 0;
}

.action-buttons {
  align-items: center;
}

/* Responsive Design */
@media (max-width: 992px) {
  .tag-list-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .tag-stats {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stat-group {
    justify-content: space-around;
    gap: 1rem;
  }
  
  .usage-indicator {
    min-width: auto;
    text-align: left;
  }
  
  .tag-actions {
    align-self: center;
  }
}

@media (max-width: 768px) {
  .tag-list-item {
    padding: 1rem;
  }
  
  .tag-header {
    flex-wrap: wrap;
    gap: 0.5rem !important;
  }
  
  .tag-name {
    font-size: 1rem;
  }
  
  .stat-group {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-item {
    justify-content: space-between;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }
  
  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tag-list-item {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .tag-name {
    color: #e2e8f0;
  }
  
  .tag-slug {
    background-color: #4a5568;
    color: #a0aec0;
  }
  
  .tag-description {
    color: #a0aec0;
  }
  
  .stat-value {
    color: #e2e8f0;
  }
  
  .stat-label,
  .usage-text {
    color: #a0aec0;
  }
  
  .usage-bar {
    background-color: #4a5568;
  }
  
  .stat-item {
    background-color: #4a5568;
  }
}

/* Animation for list item entrance */
.tag-list-item {
  animation: fadeInLeft 0.3s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hover effects for buttons */
.action-buttons .btn:hover {
  transform: scale(1.05);
}
</style>
