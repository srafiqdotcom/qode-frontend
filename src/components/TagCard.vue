<template>
  <div class="tag-card-wrapper">
    <div class="tag-card" :style="{ borderLeftColor: tag.color }">
      <!-- Tag Header -->
      <div class="tag-header">
        <div class="tag-color-indicator" :style="{ backgroundColor: tag.color }"></div>
        <div class="tag-info flex-grow-1">
          <h6 class="tag-name mb-1">{{ tag.name }}</h6>
          <div class="tag-meta">
            <span class="tag-slug">{{ tag.slug }}</span>
          </div>
        </div>
        <div class="tag-actions dropdown">
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

      <!-- Tag Description -->
      <div v-if="tag.description" class="tag-description">
        <p class="mb-0">{{ tag.description }}</p>
      </div>

      <!-- Tag Stats -->
      <div class="tag-stats">
        <div class="stat-item">
          <div class="stat-number">{{ tag.blogs_count || 0 }}</div>
          <div class="stat-label">{{ tag.blogs_count === 1 ? 'Blog' : 'Blogs' }}</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ formatDate(tag.created_at) }}</div>
          <div class="stat-label">Created</div>
        </div>
      </div>

      <!-- Tag Footer -->
      <div class="tag-footer">
        <div class="tag-usage">
          <div class="usage-bar">
            <div 
              class="usage-fill" 
              :style="{ 
                width: getUsagePercentage() + '%',
                backgroundColor: tag.color 
              }"
            ></div>
          </div>
          <small class="usage-text">
            {{ getUsageText() }}
          </small>
        </div>
        
        <div class="tag-quick-actions">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="$emit('view-blogs', tag)"
            :disabled="tag.blogs_count === 0"
            title="View blogs with this tag"
          >
            <i class="bi bi-eye"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="$emit('edit', tag)"
            title="Edit tag"
          >
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </div>

      <!-- Hover Overlay -->
      <div class="hover-overlay">
        <div class="overlay-content">
          <button
            class="btn btn-primary btn-sm"
            @click="$emit('view-blogs', tag)"
            :disabled="tag.blogs_count === 0"
          >
            <i class="bi bi-eye me-1"></i>
            View Blogs
          </button>
          <button
            class="btn btn-outline-light btn-sm"
            @click="$emit('edit', tag)"
          >
            <i class="bi bi-pencil me-1"></i>
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
</script>

<style scoped>
.tag-card-wrapper {
  height: 100%;
}

.tag-card {
  height: 100%;
  background: white;
  border: 1px solid #dee2e6;
  border-left: 4px solid #6c757d;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.tag-card:hover .hover-overlay {
  opacity: 1;
}

.tag-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.tag-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.tag-name {
  color: #495057;
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.tag-slug {
  color: #6c757d;
  font-size: 0.85rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}

.tag-actions {
  flex-shrink: 0;
}

.tag-description {
  flex-grow: 1;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.tag-description p {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid #f8f9fa;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #495057;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: #dee2e6;
}

.tag-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.tag-usage {
  flex-grow: 1;
}

.usage-bar {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.usage-text {
  color: #6c757d;
  font-size: 0.8rem;
}

.tag-quick-actions {
  display: flex;
  gap: 0.5rem;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(13, 110, 253, 0.9), rgba(102, 16, 242, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 0.5rem;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tag-card {
    padding: 1rem;
  }
  
  .tag-header {
    gap: 0.5rem;
  }
  
  .tag-name {
    font-size: 1rem;
  }
  
  .tag-stats {
    gap: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.1rem;
  }
  
  .tag-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }
  
  .tag-quick-actions {
    justify-content: center;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tag-card {
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
  
  .tag-stats {
    border-color: #4a5568;
  }
  
  .stat-number {
    color: #e2e8f0;
  }
  
  .stat-label,
  .usage-text {
    color: #a0aec0;
  }
  
  .stat-divider {
    background-color: #4a5568;
  }
  
  .usage-bar {
    background-color: #4a5568;
  }
}

/* Animation for card entrance */
.tag-card-wrapper {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects for buttons */
.tag-quick-actions .btn:hover {
  transform: scale(1.05);
}

.overlay-content .btn:hover {
  transform: scale(1.05);
}
</style>
