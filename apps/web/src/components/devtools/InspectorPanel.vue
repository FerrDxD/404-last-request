<template>
  <section class="inspector-panel">
    <div class="inspector-toolbar">
      <span class="label-mono">DOM INSPECTOR</span>
      <span v-if="selectedElement" class="status-pill success">SELECTED</span>
    </div>
    <div v-if="inspectorItems.length" class="element-list" aria-label="Inspectable application elements">
      <button
        v-for="entry in inspectorItems"
        :key="entry.evidenceId"
        class="element-item"
        :class="{ active: selectedElement?.evidenceId === entry.evidenceId }"
        :aria-pressed="selectedElement?.evidenceId === entry.evidenceId"
        @click="inspect(entry.evidenceId)"
      >
        <span class="element-icon">&lt;/&gt;</span>
        <span><b>{{ entry.element.tag }}</b><small>#{{ entry.element.id }}</small></span>
        <span v-if="caseStore.caseState?.inspectedEvidence.includes(entry.evidenceId)" class="inspected-mark" aria-label="Inspected">✓</span>
      </button>
    </div>
    <div v-if="selectedElement" class="inspector-content">
      <div class="breadcrumb label-mono">application <span>›</span> {{ selectedElement.element.tag }}</div>
      <h3>&lt;{{ selectedElement.element.tag }}&gt;</h3>
      <section v-if="Object.keys(selectedElement.element.attributes).length" class="inspector-section">
        <h4 class="label-mono">ATTRIBUTES</h4>
        <div v-for="(value, key) in selectedElement.element.attributes" :key="key" class="property-row">
          <span>{{ key }}</span><code>{{ value }}</code>
        </div>
      </section>
      <section v-if="selectedElement.element.events?.length" class="inspector-section">
        <h4 class="label-mono">EVENT LISTENERS</h4>
        <div v-for="event in selectedElement.element.events" :key="event" class="event-chip">◉ {{ event }}</div>
      </section>
      <section v-if="selectedElement.element.state && Object.keys(selectedElement.element.state).length" class="inspector-section">
        <h4 class="label-mono">APPLICATION STATE</h4>
        <pre class="state-view code-base">{{ JSON.stringify(selectedElement.element.state, null, 2) }}</pre>
      </section>
    </div>
    <p v-else class="empty-state">Select a fictional application element to inspect its attributes, event handlers, and state.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCaseStore } from '@/stores/case.store'
import type { InspectableElement } from '@404-last-request/shared'

const caseStore = useCaseStore()

const inspectorItems = computed(() => (caseStore.caseDefinition?.content.evidence || [])
  .filter(item => item.type === 'inspector')
  .map(item => ({ evidenceId: item.id, element: item.content as InspectableElement })))

const selectedElement = computed(() => inspectorItems.value.find(item =>
  item.evidenceId === caseStore.caseState?.inspectedElementId
) || null)

function inspect(evidenceId: string) {
  caseStore.applyAction({ type: 'inspect', elementId: evidenceId })
}
</script>

<style scoped>
.inspector-panel { height: 100%; display: flex; flex-direction: column; background: var(--color-canvas-root); overflow: auto; }
.inspector-toolbar { min-height: 34px; padding: 0 .7rem; display: flex; align-items: center; justify-content: space-between; background: var(--color-surface-raised); border-bottom: 1px solid var(--color-hairline-stroke); }
.inspector-toolbar .label-mono { color: var(--color-text-muted); font-size: 9px; }
.inspector-toolbar .status-pill { font-size: 7px; }
.element-list { padding: .5rem; border-bottom: 1px solid var(--color-hairline-stroke); }
.element-item { width: 100%; min-height: 42px; display: flex; align-items: center; gap: .6rem; padding: .4rem; border: 1px solid transparent; background: transparent; color: var(--color-text-primary); text-align: left; cursor: pointer; }
.element-item:hover, .element-item.active { background: var(--color-surface-raised); border-color: var(--color-primary-border); }
.element-icon { color: var(--color-primary); font: 10px var(--font-mono); }
.element-item b, .element-item small { display: block; }
.element-item b { font: 600 10px var(--font-display); }
.element-item small { margin-top: .15rem; color: var(--color-text-muted); font: 8px var(--font-mono); }
.inspected-mark { margin-left: auto; color: var(--color-secondary); }
.inspector-content { padding: .8rem; }
.breadcrumb { color: var(--color-text-muted); font-size: 8px; }
.breadcrumb span { color: var(--color-primary); padding: 0 .25rem; }
.inspector-content h3 { margin: .55rem 0 .9rem; color: var(--color-primary); font: 600 13px var(--font-mono); }
.inspector-section { margin-top: .8rem; }
.inspector-section h4 { margin-bottom: .35rem; color: var(--color-text-ghost); font-size: 8px; }
.property-row { display: flex; justify-content: space-between; gap: .7rem; padding: .35rem .45rem; border-bottom: 1px solid var(--color-hairline-stroke); font: 9px var(--font-mono); }
.property-row > span { color: var(--color-primary); overflow-wrap: anywhere; }
.property-row code { color: var(--color-text-primary); text-align: right; overflow-wrap: anywhere; }
.event-chip { padding: .4rem; margin-top: .3rem; background: var(--color-surface-raised); color: var(--color-amber); font: 9px var(--font-mono); }
.state-view { overflow: auto; max-height: 180px; padding: .5rem; background: var(--color-surface-raised); color: var(--color-text-primary); font-size: 9px; }
.empty-state { padding: 1.5rem .9rem; color: var(--color-text-muted); text-align: center; font-size: 10px; line-height: 1.6; }
</style>
