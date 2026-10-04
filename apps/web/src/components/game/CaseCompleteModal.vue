<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h1 class="title">Case Complete!</h1>
      <div class="score-display">
        <div class="score-item">
          <span class="label">Time</span>
          <span class="value">{{ formatTime(score?.scoreResult?.elapsedTime || 0) }}</span>
        </div>
        <div class="score-item">
          <span class="label">Attempts</span>
          <span class="value">{{ score?.scoreResult?.attempts || 0 }}</span>
        </div>
        <div class="score-item">
          <span class="label">Hints</span>
          <span class="value">{{ score?.scoreResult?.hintsUsed || 0 }}</span>
        </div>
        <div class="score-item total">
          <span class="label">Score</span>
          <span class="value">{{ score?.score || 0 }}</span>
        </div>
        <div class="rating">
          <span class="rating-stars">{{ score?.scoreResult?.rating || '★☆☆☆☆' }}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary" @click="$emit('close')">Review</button>
        <RouterLink to="/cases" class="btn btn-primary">Back to Cases</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  score: any
}>()

defineEmits<{
  close: []
}>()

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  color: #238636;
  margin-bottom: 2rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #0d1117;
  border-radius: 6px;
}

.score-item.total {
  background: #238636;
  font-size: 1.25rem;
  font-weight: 700;
}

.label {
  color: #8b949e;
}

.value {
  color: #c9d1d9;
  font-weight: 600;
}

.score-item.total .label,
.score-item.total .value {
  color: white;
}

.rating {
  margin-top: 1rem;
  font-size: 2rem;
}

.rating-stars {
  color: #e3b341;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
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

.btn-secondary {
  background: #30363d;
  color: #c9d1d9;
}

.btn-secondary:hover {
  background: #3d444d;
}
</style>
