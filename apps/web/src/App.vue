<template>
  <div id="app" :class="{ 'reduce-motion': progressStore.settings.reducedMotion }">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useProgressStore } from '@/stores/progress.store'

const progressStore = useProgressStore()
progressStore.loadProgress()
</script>

<style>
@import './styles/design-system.css';

#app {
  min-height: 100vh;
  background: var(--color-canvas-root);
}

#app.reduce-motion *,
#app.reduce-motion *::before,
#app.reduce-motion *::after {
  scroll-behavior: auto !important;
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
</style>
