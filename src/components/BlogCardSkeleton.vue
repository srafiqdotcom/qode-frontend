<template>
  <div class="col-sm-6 col-md-6 col-lg-4 col-xl-3 col-xxl-2-4 mb-4">
    <div class="card h-100">
      <div class="skeleton-image"></div>
      <div class="card-body">
        <div class="skeleton-title mb-2"></div>
        <div class="skeleton-text mb-1"></div>
        <div class="skeleton-text mb-1"></div>
        <div class="skeleton-text mb-3" style="width: 70%;"></div>
        
        <div class="d-flex gap-1 mb-3">
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
          <div class="skeleton-badge"></div>
        </div>
        
        <div class="mt-auto">
          <div class="d-flex justify-content-between mb-2">
            <div class="skeleton-date"></div>
            <div class="skeleton-comments"></div>
          </div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom 5-column layout for ultra-wide screens */
.col-xxl-2-4 {
  flex: 0 0 auto;
}

@media (min-width: 1400px) {
  .col-xxl-2-4 {
    width: 20%; /* 5 columns = 20% each */
  }
}

.skeleton-image {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-badge {
  height: 20px;
  width: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 12px;
}

.skeleton-date {
  height: 14px;
  width: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-comments {
  height: 14px;
  width: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-button {
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.card {
  border: 1px solid rgba(0,0,0,0.125);
}
</style>
