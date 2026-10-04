<template>
  <header class="game-header">
    <RouterLink to="/cases" class="back-link">‹ DOCKET</RouterLink>
    <div class="case-identity">
      <span class="status-pill danger">CASE {{ caseDefinition?.order?.toString().padStart(2, '0') || '??' }}</span>
      <h1>{{ caseDefinition?.title || 'Loading incident…' }}</h1>
    </div>
    <div class="header-right">
      <span class="label-mono difficulty">DIFF <b>{{ '★'.repeat(caseDefinition?.difficulty || 1) }}<span>{{ '☆'.repeat(Math.max(0, 5 - (caseDefinition?.difficulty || 1))) }}</span></b></span>
      <div class="timer"><span class="timer-icon">◷</span>{{ formatTime(elapsedTime) }}</div>
      <span class="status-pill success"><span class="online-dot"></span> STAGING</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCaseStore } from '@/stores/case.store'

const caseStore = useCaseStore()
const caseDefinition = computed(() => caseStore.caseDefinition)
const elapsedTime = computed(() => caseStore.elapsedTime)

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}
</script>

<style scoped>
.game-header { min-height: 58px; display: flex; align-items: center; gap: 1.2rem; padding: .55rem 1.2rem; background: #090c11; border-bottom: 1px solid var(--color-hairline-stroke); position: relative; z-index: 1; }
.back-link { color: var(--color-text-muted); text-decoration: none; font: 9px var(--font-mono); white-space: nowrap; }
.back-link:hover { color: var(--color-primary); }
.case-identity { display: flex; align-items: center; gap: .7rem; min-width: 0; }
.case-identity h1 { font: 600 13px var(--font-display); color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.header-right { display: flex; align-items: center; gap: .75rem; margin-left: auto; }
.difficulty { white-space: nowrap; color: var(--color-text-muted); }
.difficulty b { margin-left: .35rem; color: var(--color-amber); }
.difficulty b span { color: var(--color-text-ghost); }
.timer { display: flex; gap: .35rem; align-items: center; color: var(--color-tertiary); font: 700 11px var(--font-mono); padding: .35rem .5rem; background: var(--color-tertiary-dim); border: 1px solid var(--color-tertiary-border); }
.timer-icon { font-size: 15px; }
.online-dot { width: 6px; height: 6px; display: inline-block; border-radius: 50%; background: var(--color-secondary); }
.status-pill { display: inline-flex; gap: .35rem; align-items: center; }
@media (max-width: 700px) { .game-header { flex-wrap: wrap; gap: .5rem; padding: .6rem; } .case-identity { order: 2; width: 100%; } .header-right { gap: .4rem; } .difficulty { display: none; } }
</style>
