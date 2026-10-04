<template>
  <div class="not-found-page">
    <h1 class="title">404</h1>
    <p class="subtitle">Page not found</p>
    <RouterLink to="/" class="btn btn-primary">Go Home</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0d1117;
  gap: 2rem;
}

.title {
  font-size: 6rem;
  color: #f85149;
  font-weight: 700;
}

.subtitle {
  font-size: 1.5rem;
  color: #8b949e;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #238636;
  color: white;
}

.btn-primary:hover {
  background: #2ea043;
}
</style>
