<template>
  <div class="console-panel">
    <div class="console-entries">
      <button
        v-for="(entry, index) in consoleEntries"
        :key="index"
        class="console-entry"
        :class="entry.level"
        type="button"
        :aria-label="`Inspect ${entry.level} message: ${entry.message}`"
        @click="inspectEntry(index)"
      >
        <span class="timestamp code-compact">{{ formatTime(entry.timestamp) }}</span>
        <span class="message code-base">{{ entry.message }}</span>
        <span v-if="isInspected(index)" class="inspected-mark" aria-label="Inspected">✓</span>
      </button>
    </div>
    <p v-if="!consoleEntries.length" class="empty-state">No console messages were recorded for this case.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCaseStore } from '@/stores/case.store'
import type { ConsoleEntry } from '@404-last-request/shared'

const caseStore = useCaseStore()

const consoleEvidence = computed(() => {
  const evidence = caseStore.caseDefinition?.content.evidence || []
  return evidence
    .filter(e => e.type === 'console')
    .map(e => ({ id: e.id, content: e.content as ConsoleEntry }))
})
const consoleEntries = computed(() => consoleEvidence.value.map(e => e.content))

function inspectEntry(index: number) {
  const evidence = consoleEvidence.value[index]
  if (evidence) caseStore.applyAction({ type: 'inspect', elementId: evidence.id })
}

function isInspected(index: number): boolean {
  const evidence = consoleEvidence.value[index]
  return Boolean(evidence && caseStore.caseState?.inspectedEvidence.includes(evidence.id))
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.console-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-canvas-root);
}

.console-entries {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.console-entry {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  line-height: 1.4;
  min-height: var(--height-row);
}

.console-entry:hover { background: var(--color-surface-raised); }
.inspected-mark { margin-left: auto; color: var(--color-secondary); }
.empty-state { margin: auto; padding: 1.5rem; color: var(--color-text-muted); text-align: center; font-size: 10px; }
.timestamp {
  color: var(--color-text-ghost);
  flex-shrink: 0;
}

.message {
  color: var(--color-text-primary);
}

.console-entry.log .message {
  color: var(--color-text-primary);
}

.console-entry.info .message {
  color: var(--color-primary);
}

.console-entry.warn .message {
  color: var(--color-amber);
}

.console-entry.error .message {
  color: var(--color-tertiary);
}
</style>
