<template>
  <section class="devtools-panel panel">
    <div class="tabs" role="tablist" aria-label="Simulated developer tools">
      <button
        v-for="tab in tabs"
        :id="`tool-tab-${tab.id}`"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.type }"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.type"
        :aria-controls="`tool-panel-${tab.type}`"
        :data-tool="tab.type"
        @click="selectTool(tab.type)"
      >
        {{ tab.name }}
      </button>
    </div>
    <div :id="`tool-panel-${activeTab}`" class="tab-content" role="tabpanel" :aria-labelledby="`tool-tab-${activeTab}`">
      <ConsolePanel v-if="activeTab === 'console'" />
      <NetworkPanel v-else-if="activeTab === 'network'" />
      <FilesPanel v-else-if="activeTab === 'files'" />
      <InspectorPanel v-else />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import ConsolePanel from './ConsolePanel.vue'
import NetworkPanel from './NetworkPanel.vue'
import FilesPanel from './FilesPanel.vue'
import InspectorPanel from './InspectorPanel.vue'
import { useCaseStore } from '@/stores/case.store'
import { useGameStore } from '@/stores/game.store'

const caseStore = useCaseStore()
const gameStore = useGameStore()
const tabs = computed(() => caseStore.caseDefinition?.content.tools || [])
const activeTab = computed(() => gameStore.activeTool)

watch(() => caseStore.caseState?.currentTool, tool => {
  if (tool) gameStore.setActiveTool(tool)
})

function selectTool(tool: string): void {
  gameStore.setActiveTool(tool)
  caseStore.setCurrentTool(tool as 'console' | 'network' | 'files' | 'inspector')
}
</script>

<style scoped>
.devtools-panel { width: min(360px, 34vw); flex: 0 0 min(360px, 34vw); display: flex; flex-direction: column; border-radius: 0; border: none; border-right: 1px solid var(--color-hairline-stroke); }
.tabs { display: flex; flex: 0 0 auto; background: var(--color-panel-base); border-bottom: 1px solid var(--color-hairline-stroke); }
.tab { flex: 1; min-width: 0; padding: var(--space-sm) .3rem; background: transparent; border: 0; border-bottom: 2px solid transparent; color: var(--color-text-muted); font: 500 9px var(--font-mono); letter-spacing: .04em; text-transform: uppercase; cursor: pointer; transition: color .15s ease, background .15s ease; }
.tab:hover { color: var(--color-text-primary); background: var(--color-surface-raised); }
.tab.active { color: var(--color-primary); border-bottom-color: var(--color-primary); background: var(--color-surface-float); }
.tab-content { min-height: 0; flex: 1; overflow: hidden; }
@media (max-width: 820px) { .devtools-panel { width: 100%; flex: 0 0 380px; border-right: 0; border-bottom: 1px solid var(--color-hairline-stroke); } }
</style>
