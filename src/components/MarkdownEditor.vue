<template>
  <div class="markdown-editor" :class="{ 'fullscreen': isFullscreen }">
    <!-- Editor Header -->
    <div class="editor-header d-flex justify-content-between align-items-center">
      <div class="editor-tabs">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'write' }"
          @click="setActiveTab('write')"
        >
          <i class="bi bi-pencil me-1"></i>
          Write
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'preview' }"
          @click="setActiveTab('preview')"
          :disabled="!content.trim()"
        >
          <i class="bi bi-eye me-1"></i>
          Preview
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'split' }"
          @click="setActiveTab('split')"
          :disabled="!content.trim()"
        >
          <i class="bi bi-layout-split me-1"></i>
          Split
        </button>
      </div>
      
      <div class="editor-actions d-flex gap-2">
        <!-- Formatting Toolbar -->
        <div class="formatting-toolbar d-flex gap-1">
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertFormatting('**', '**')"
            title="Bold (Ctrl+B)"
          >
            <i class="bi bi-type-bold"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertFormatting('*', '*')"
            title="Italic (Ctrl+I)"
          >
            <i class="bi bi-type-italic"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertFormatting('`', '`')"
            title="Code"
          >
            <i class="bi bi-code"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertFormatting('[', '](url)')"
            title="Link"
          >
            <i class="bi bi-link-45deg"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertList()"
            title="List"
          >
            <i class="bi bi-list-ul"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="insertQuote()"
            title="Quote"
          >
            <i class="bi bi-quote"></i>
          </button>
        </div>
        
        <div class="divider"></div>
        
        <!-- Editor Controls -->
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
        >
          <i class="bi" :class="isFullscreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'"></i>
        </button>
        
        <button
          v-if="showHelp"
          class="btn btn-sm btn-outline-secondary"
          @click="showMarkdownHelp = true"
          title="Markdown Help"
        >
          <i class="bi bi-question-circle"></i>
        </button>
      </div>
    </div>
    
    <!-- Editor Content -->
    <div class="editor-content" :class="`tab-${activeTab}`">
      <!-- Write Tab -->
      <div v-show="activeTab === 'write' || activeTab === 'split'" class="write-panel">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="form-control editor-textarea"
          :placeholder="placeholder"
          :rows="rows"
          @input="handleInput"
          @keydown="handleKeydown"
          @scroll="syncScroll"
        ></textarea>
        
        <!-- Character Count -->
        <div v-if="showCharCount" class="char-count">
          {{ content.length }}{{ maxLength ? `/${maxLength}` : '' }} characters
        </div>
      </div>
      
      <!-- Preview Panel -->
      <div v-show="activeTab === 'preview' || activeTab === 'split'" class="preview-panel">
        <div v-if="previewLoading" class="preview-loading text-center py-4">
          <div class="spinner-border spinner-border-sm me-2"></div>
          <span>Generating preview...</span>
        </div>
        
        <div v-else-if="previewError" class="preview-error alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Failed to generate preview: {{ previewError }}
        </div>
        
        <div v-else-if="previewContent" class="preview-content" v-html="previewContent"></div>
        
        <div v-else class="preview-empty text-center py-4 text-muted">
          <i class="bi bi-eye-slash mb-2" style="font-size: 2rem;"></i>
          <p>Nothing to preview yet.<br>Start typing to see the preview.</p>
        </div>
      </div>
    </div>
    
    <!-- Editor Footer -->
    <div v-if="showFooter" class="editor-footer d-flex justify-content-between align-items-center">
      <div class="editor-info">
        <small class="text-muted">
          <i class="bi bi-markdown me-1"></i>
          Markdown supported
        </small>
      </div>
      
      <div class="editor-status d-flex gap-3">
        <small v-if="lastSaved" class="text-muted">
          <i class="bi bi-check-circle me-1"></i>
          Saved {{ formatTime(lastSaved) }}
        </small>
        <small v-if="wordCount > 0" class="text-muted">
          {{ wordCount }} words
        </small>
      </div>
    </div>
    
    <!-- Markdown Help Modal -->
    <div v-if="showMarkdownHelp" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-markdown me-2"></i>
              Markdown Guide
            </h5>
            <button type="button" class="btn-close" @click="showMarkdownHelp = false"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Text Formatting</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr><td><code>**bold**</code></td><td><strong>bold</strong></td></tr>
                    <tr><td><code>*italic*</code></td><td><em>italic</em></td></tr>
                    <tr><td><code>`code`</code></td><td><code>code</code></td></tr>
                    <tr><td><code>~~strike~~</code></td><td><del>strike</del></td></tr>
                  </tbody>
                </table>
                
                <h6>Lists</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr><td><code>- item</code></td><td>• item</td></tr>
                    <tr><td><code>1. item</code></td><td>1. item</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Other Elements</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr><td><code># Header</code></td><td><h6 class="mb-0">Header</h6></td></tr>
                    <tr><td><code>> quote</code></td><td><blockquote class="mb-0">quote</blockquote></td></tr>
                    <tr><td><code>[link](url)</code></td><td><a href="#">link</a></td></tr>
                  </tbody>
                </table>
                
                <h6>Code Blocks</h6>
                <pre><code>```
code block
```</code></pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showMarkdownHelp = false">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { commentService } from '../services/comment.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Write your comment in markdown...'
  },
  rows: {
    type: Number,
    default: 6
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showHelp: {
    type: Boolean,
    default: true
  },
  autoPreview: {
    type: Boolean,
    default: true
  },
  previewDelay: {
    type: Number,
    default: 500
  }
})

const emit = defineEmits(['update:modelValue', 'preview', 'save'])

// State
const content = ref(props.modelValue)
const activeTab = ref('write')
const isFullscreen = ref(false)
const showMarkdownHelp = ref(false)
const previewContent = ref('')
const previewLoading = ref(false)
const previewError = ref(null)
const lastSaved = ref(null)
const textareaRef = ref(null)

// Debounce timer for preview
let previewTimer = null

// Computed
const wordCount = computed(() => {
  return content.value.trim().split(/\s+/).filter(word => word.length > 0).length
})

// Methods
const handleInput = () => {
  emit('update:modelValue', content.value)
  
  if (props.autoPreview && (activeTab.value === 'preview' || activeTab.value === 'split')) {
    debouncedPreview()
  }
}

const debouncedPreview = () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => {
    generatePreview()
  }, props.previewDelay)
}

const generatePreview = async () => {
  if (!content.value.trim()) {
    previewContent.value = ''
    return
  }
  
  previewLoading.value = true
  previewError.value = null
  
  try {
    const response = await commentService.previewComment(content.value)
    previewContent.value = response.data.content
    emit('preview', response.data)
  } catch (error) {
    previewError.value = error.message || 'Failed to generate preview'
    console.error('Preview error:', error)
  } finally {
    previewLoading.value = false
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  
  if ((tab === 'preview' || tab === 'split') && content.value.trim()) {
    generatePreview()
  }
  
  if (tab === 'write') {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
}

const insertFormatting = (before, after = '') => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  
  const replacement = before + selectedText + after
  content.value = content.value.substring(0, start) + replacement + content.value.substring(end)
  
  nextTick(() => {
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
  
  handleInput()
}

const insertList = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const lineStart = content.value.lastIndexOf('\n', start - 1) + 1
  const lineEnd = content.value.indexOf('\n', start)
  const currentLine = content.value.substring(lineStart, lineEnd === -1 ? content.value.length : lineEnd)
  
  if (currentLine.trim() === '') {
    insertFormatting('- ', '')
  } else {
    const replacement = '- ' + currentLine.trim()
    content.value = content.value.substring(0, lineStart) + replacement + content.value.substring(lineEnd === -1 ? content.value.length : lineEnd)
    
    nextTick(() => {
      const newCursorPos = lineStart + replacement.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    })
  }
  
  handleInput()
}

const insertQuote = () => {
  insertFormatting('> ', '')
}

const handleKeydown = (event) => {
  // Handle keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        insertFormatting('**', '**')
        break
      case 'i':
        event.preventDefault()
        insertFormatting('*', '*')
        break
      case 'Enter':
        event.preventDefault()
        emit('save')
        break
    }
  }
  
  // Handle tab indentation
  if (event.key === 'Tab') {
    event.preventDefault()
    insertFormatting('  ', '')
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const syncScroll = () => {
  // Sync scroll between write and preview panels in split mode
  if (activeTab.value === 'split') {
    const textarea = textareaRef.value
    const preview = document.querySelector('.preview-content')
    
    if (textarea && preview) {
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
    }
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return time.toLocaleDateString()
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// Cleanup
onUnmounted(() => {
  clearTimeout(previewTimer)
  document.body.style.overflow = ''
})

// Expose methods for parent components
defineExpose({
  focus: () => textareaRef.value?.focus(),
  insertText: (text) => insertFormatting(text, ''),
  generatePreview,
  getContent: () => content.value,
  setContent: (newContent) => { content.value = newContent }
})
</script>

<style scoped>
.markdown-editor {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.3s ease;
}

.markdown-editor.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  border-radius: 0;
  border: none;
}

.editor-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0.5rem 0.5rem 0 0;
}

.fullscreen .editor-header {
  border-radius: 0;
}

.editor-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.tab-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.tab-button.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.tab-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.formatting-toolbar {
  border-right: 1px solid #dee2e6;
  padding-right: 0.5rem;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #dee2e6;
}

.editor-content {
  display: flex;
  min-height: 300px;
}

.editor-content.tab-write .write-panel,
.editor-content.tab-preview .preview-panel {
  flex: 1;
}

.editor-content.tab-split .write-panel,
.editor-content.tab-split .preview-panel {
  flex: 1;
}

.editor-content.tab-split .write-panel {
  border-right: 1px solid #dee2e6;
}

.write-panel {
  position: relative;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  border: none;
  border-radius: 0;
  resize: none;
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 1rem;
}

.editor-textarea:focus {
  box-shadow: none;
  border-color: transparent;
}

.char-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.preview-panel {
  padding: 1rem;
  overflow-y: auto;
  background-color: #fafafa;
}

.preview-content {
  line-height: 1.6;
  color: #212529;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.preview-content h1 {
  font-size: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.preview-content h2 {
  font-size: 1.25rem;
}

.preview-content h3 {
  font-size: 1.1rem;
}

.preview-content code {
  background-color: #f1f3f4;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #e83e8c;
}

.preview-content pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  border-left: 4px solid #0d6efd;
}

.preview-content pre code {
  background: none;
  padding: 0;
  color: #212529;
}

.preview-content blockquote {
  border-left: 4px solid #dee2e6;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6c757d;
  font-style: italic;
}

.preview-content ul,
.preview-content ol {
  padding-left: 1.5rem;
}

.preview-content li {
  margin-bottom: 0.25rem;
}

.preview-content a {
  color: #0d6efd;
  text-decoration: none;
}

.preview-content a:hover {
  text-decoration: underline;
}

.editor-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0 0 0.5rem 0.5rem;
}

.fullscreen .editor-footer {
  border-radius: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .editor-content.tab-split {
    flex-direction: column;
  }
  
  .editor-content.tab-split .write-panel {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .formatting-toolbar {
    display: none;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .editor-actions {
    justify-content: flex-end;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .markdown-editor {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .editor-header,
  .editor-footer {
    background-color: #1a202c;
    border-color: #4a5568;
  }
  
  .tab-button {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .tab-button:hover:not(:disabled) {
    background-color: #4a5568;
  }
  
  .editor-textarea {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .preview-panel {
    background-color: #1a202c;
  }
  
  .preview-content {
    color: #e2e8f0;
  }
}
</style>
