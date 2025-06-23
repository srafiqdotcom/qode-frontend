import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useInfiniteScroll(loadMoreCallback, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    initialPage = 1,
    itemsPerPage = 12,
    debounceMs = 300
  } = options

  // State
  const isLoading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(initialPage)
  const error = ref(null)
  const items = ref([])
  const totalItems = ref(0)
  
  // Observer and elements
  const observerTarget = ref(null)
  const observer = ref(null)
  const loadingTimeout = ref(null)

  // Debounced loading function
  const debouncedLoad = (() => {
    let timeoutId = null
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => loadMore(...args), debounceMs)
    }
  })()

  const loadMore = async (force = false) => {
    // Prevent multiple simultaneous loads
    if (isLoading.value && !force) return
    if (!hasMore.value && !force) return

    isLoading.value = true
    error.value = null

    try {
      const response = await loadMoreCallback({
        page: currentPage.value,
        per_page: itemsPerPage
      })

      // Handle different response structures
      const newItems = response.data || response.items || response
      const pagination = response.meta || response.pagination || {}

      console.log('useInfiniteScroll - response:', response)
      console.log('useInfiniteScroll - newItems:', newItems)
      console.log('useInfiniteScroll - pagination:', pagination)

      // Filter out any null/undefined items
      const validNewItems = (Array.isArray(newItems) ? newItems : []).filter(item => item && item.id)
      console.log('useInfiniteScroll - validNewItems:', validNewItems)

      if (force || currentPage.value === 1) {
        // Reset for first load or forced refresh
        items.value = validNewItems
      } else {
        // Append new items, avoiding duplicates
        const existingIds = new Set(items.value.filter(item => item && item.id).map(item => item.id))
        const uniqueNewItems = validNewItems.filter(item => !existingIds.has(item.id))
        items.value = [...items.value, ...uniqueNewItems]
      }

      // Update pagination info
      totalItems.value = pagination.total || response.total || items.value.length

      // Check if there are more items
      const currentTotal = items.value.length
      const serverTotal = totalItems.value
      const hasNextPage = pagination.current_page < pagination.last_page ||
                         pagination.has_more_pages ||
                         currentTotal < serverTotal

      hasMore.value = hasNextPage && validNewItems.length > 0

      // Increment page for next load
      if (validNewItems.length > 0) {
        currentPage.value++
      }

    } catch (err) {
      console.error('Error loading more items:', err)
      error.value = err.message || 'Failed to load more items'
      
      // Don't increment page on error
      hasMore.value = false
    } finally {
      isLoading.value = false
    }
  }

  const setupObserver = () => {
    if (!observerTarget.value) return

    observer.value = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore.value && !isLoading.value) {
          debouncedLoad()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.value.observe(observerTarget.value)
  }

  const destroyObserver = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  const reset = async () => {
    currentPage.value = initialPage
    hasMore.value = true
    error.value = null
    items.value = []
    totalItems.value = 0
    
    await nextTick()
    await loadMore(true)
  }

  const refresh = async () => {
    currentPage.value = initialPage
    hasMore.value = true
    error.value = null
    
    await loadMore(true)
  }

  const loadInitial = async () => {
    currentPage.value = initialPage
    await loadMore(true)
  }

  // Manual load more (for button-based loading)
  const manualLoadMore = async () => {
    if (!isLoading.value && hasMore.value) {
      await loadMore()
    }
  }

  // Setup observer when target is available
  const setObserverTarget = (element) => {
    observerTarget.value = element
    if (element) {
      nextTick(() => setupObserver())
    }
  }

  // Lifecycle
  onMounted(() => {
    if (observerTarget.value) {
      setupObserver()
    }
  })

  onUnmounted(() => {
    destroyObserver()
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
    }
  })

  return {
    // State
    items,
    isLoading,
    hasMore,
    error,
    currentPage,
    totalItems,
    
    // Methods
    loadMore: manualLoadMore,
    reset,
    refresh,
    loadInitial,
    setObserverTarget,
    
    // Computed
    isEmpty: () => items.value.length === 0 && !isLoading.value,
    isFirstLoad: () => currentPage.value === initialPage && isLoading.value,
    
    // Internal (for debugging)
    _observer: observer,
    _observerTarget: observerTarget
  }
}
