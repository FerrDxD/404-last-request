<template>
  <aside class="mission-panel">
    <div class="mission-heading">
      <h2>▣ Case dossier // {{ caseDefinition?.order.toString().padStart(2, '0') }}</h2>
      <span class="status-pill success">ACTIVE SLA</span>
    </div>
    <section class="objective-card">
      <span class="label-mono">MISSION OBJECTIVE</span>
      <p>{{ caseDefinition?.content.objective.description }}</p>
    </section>
    <section class="clue-section">
      <div class="clue-heading">
        <h3>Clues identified</h3>
        <span>{{ inspectedCount }} / {{ evidence.length }}</span>
      </div>
      <div class="clue-progress"><span :style="{ width: `${clueProgress}%` }"></span></div>
      <div v-if="evidence.length" class="clue-list">
        <div v-for="item in evidence" :key="item.id" class="clue-item">
          <span class="clue-check" :class="{ found: isInspected(item.id) }">{{ isInspected(item.id) ? '✓' : '○' }}</span>
          <span><b>{{ evidenceLabel(item.type) }}</b><small>{{ item.id.replace(/-/g, ' ') }}</small></span>
        </div>
      </div>
      <p v-else class="empty-clues">No evidence is attached to this incident.</p>
    </section>
    <section class="war-room">
      <div class="war-room-heading"><span>▤</span><b>#war-room-case-{{ caseDefinition?.order.toString().padStart(2, '0') }}</b><span class="online-dot"></span></div>
      <div class="message-avatar">M</div>
      <p class="message-author">Maya // Lead PM</p>
      <p class="message-text">The client is waiting on this fix. Check the request contract and verify the patch before you deploy.</p>
      <span class="message-time">MISSION CONTROL · NOW</span>
    </section>
    <div class="attempt-stats">
      <div><span>ATTEMPTS</span><b>{{ attempts }}</b></div>
      <div><span>ELAPSED</span><b>{{ formatTime(elapsedTime) }}</b></div>
      <div><span>HINTS</span><b>{{ hintsUsed }} / 3</b></div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCaseStore } from '@/stores/case.store'

const caseStore = useCaseStore()
const caseDefinition = computed(() => caseStore.caseDefinition)
const evidence = computed(() => caseDefinition.value?.content.evidence || [])
const inspectedEvidence = computed(() => caseStore.caseState?.inspectedEvidence || [])
const inspectedCount = computed(() => evidence.value.filter(item => inspectedEvidence.value.includes(item.id)).length)
const clueProgress = computed(() => evidence.value.length ? (inspectedCount.value / evidence.value.length) * 100 : 0)
const attempts = computed(() => caseStore.attempts)
const hintsUsed = computed(() => caseStore.hintsUsed)
const elapsedTime = computed(() => caseStore.elapsedTime)

function isInspected(id: string): boolean {
  return inspectedEvidence.value.includes(id)
}

function evidenceLabel(type: string): string {
  return type === 'file' ? 'SOURCE FILE' : type.toUpperCase()
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mission-panel { width: 275px; flex: 0 0 275px; display: flex; flex-direction: column; gap: .75rem; padding: .75rem; background: #10151b; border-left: 1px solid var(--color-hairline-stroke); overflow-y: auto; }
.mission-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .4rem; }
.mission-heading h2 { font: 700 10px var(--font-mono); color: var(--color-text-primary); }
.mission-heading .status-pill { font-size: 8px; }
.objective-card { padding: .7rem; background: var(--color-canvas-root); border: 1px solid var(--color-hairline-stroke); }
.objective-card .label-mono { color: var(--color-primary); font-size: 8px; }
.objective-card p { margin-top: .4rem; color: var(--color-text-primary); font-size: 10px; line-height: 1.55; }
.clue-section { padding: .7rem; background: var(--color-surface-raised); }
.clue-heading { display: flex; justify-content: space-between; align-items: center; gap: .4rem; }
.clue-heading h3 { font: 600 11px var(--font-display); }
.clue-heading > span { color: var(--color-primary); font: 700 9px var(--font-mono); }
.clue-progress { height: 5px; margin: .55rem 0; background: var(--color-canvas-root); }
.clue-progress span { display: block; height: 100%; background: var(--color-primary); }
.clue-list { display: flex; flex-direction: column; gap: .2rem; }
.clue-item { display: flex; align-items: flex-start; gap: .45rem; padding: .45rem .2rem; border-top: 1px solid rgba(34, 45, 61, .55); }
.clue-check { color: var(--color-text-ghost); font-size: 12px; }
.clue-check.found { color: var(--color-secondary); }
.clue-item b, .clue-item small { display: block; }
.clue-item b { color: var(--color-text-primary); font: 700 8px var(--font-mono); }
.clue-item small { margin-top: .18rem; color: var(--color-text-muted); font-size: 9px; text-transform: capitalize; }
.empty-clues { color: var(--color-text-muted); font-size: 10px; }
.war-room { position: relative; padding: .7rem; background: #090c11; border: 1px solid var(--color-hairline-stroke); }
.war-room-heading { display: flex; align-items: center; gap: .4rem; padding-bottom: .5rem; border-bottom: 1px solid var(--color-hairline-stroke); font: 9px var(--font-mono); color: var(--color-text-muted); }
.war-room-heading .online-dot { width: 6px; height: 6px; margin-left: auto; }
.message-avatar { float: left; display: grid; place-items: center; width: 26px; height: 26px; margin: .7rem .45rem .3rem 0; border-radius: 50%; background: #8d4751; color: white; font: 700 11px var(--font-display); }
.message-author { padding-top: .7rem; font: 700 9px var(--font-mono); color: var(--color-primary); }
.message-text { clear: both; padding: .55rem; background: var(--color-surface-raised); color: var(--color-text-muted); font-size: 10px; line-height: 1.55; }
.message-time { display: block; margin-top: .4rem; text-align: right; color: var(--color-text-ghost); font: 8px var(--font-mono); }
.attempt-stats { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: auto; padding: .6rem .35rem; background: var(--color-canvas-root); border: 1px solid var(--color-hairline-stroke); }
.attempt-stats div { display: flex; flex-direction: column; align-items: center; gap: .2rem; border-right: 1px solid var(--color-hairline-stroke); }
.attempt-stats div:last-child { border: 0; }
.attempt-stats span { color: var(--color-text-ghost); font: 8px var(--font-mono); }
.attempt-stats b { color: var(--color-text-primary); font: 700 10px var(--font-mono); }
@media (max-width: 1080px) { .mission-panel { width: 235px; flex-basis: 235px; } }
@media (max-width: 820px) { .mission-panel { width: auto; flex-basis: auto; max-height: 340px; border-left: 0; border-top: 1px solid var(--color-hairline-stroke); } }
</style>
