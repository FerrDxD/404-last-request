<template>
  <div class="game-page">
    <div v-if="loading" class="page-state">CONNECTING TO INCIDENT SANDBOX…</div>
    <div v-else-if="error" class="page-state error">{{ error }} <RouterLink to="/cases">Return to docket</RouterLink></div>
    <template v-else>
      <GameHeader />
      <div class="station-layout">
        <aside class="tool-rail">
          <span class="label-mono rail-title">DEV_STATION</span>
          <button
            v-for="tool in caseStore.caseDefinition?.content.tools || []"
            :key="tool.id"
            class="rail-item"
            :class="{ active: gameStore.activeTool === tool.type }"
            :aria-pressed="gameStore.activeTool === tool.type"
            @click="selectTool(tool.type)"
          >
            <span aria-hidden="true">{{ toolIcon(tool.type) }}</span> <span>{{ tool.name }}</span>
          </button>
          <button class="rail-item reset-lab" @click="resetLab">↻ <span>Reset lab</span></button>
          <div class="rail-spacer"></div>
          <RouterLink to="/cases" class="rail-exit">← Back to docket</RouterLink>
        </aside>
        <main class="workbench">
          <div class="session-bar">
            <span><i></i> DEV_STATION // {{ caseStore.caseDefinition?.slug }}</span>
            <span>SESSION: <b>{{ sessionStatus }}</b></span>
            <span>RUNNER: <b>SIMULATED</b></span>
          </div>
          <p v-if="persistenceNotice" class="persistence-notice" role="status">{{ persistenceNotice }}</p>
          <div class="game-content">
            <DevToolsPanel />
            <ApplicationPanel />
            <MissionBriefPanel />
          </div>
        </main>
      </div>
      <GameStatusBar />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useCaseStore } from '@/stores/case.store'
import { useProgressStore } from '@/stores/progress.store'
import { useGameStore } from '@/stores/game.store'
import { calculateScore } from '@/game/scoring/calculator'
import type { ToolDefinition } from '@404-last-request/shared'
import { completeSession, createSession, fetchCase, fetchCases } from '@/services/api'
import GameHeader from '@/components/game/GameHeader.vue'
import DevToolsPanel from '@/components/devtools/DevToolsPanel.vue'
import ApplicationPanel from '@/components/game/ApplicationPanel.vue'
import MissionBriefPanel from '@/components/game/MissionBriefPanel.vue'
import GameStatusBar from '@/components/game/GameStatusBar.vue'

const route = useRoute()
const router = useRouter()
const caseStore = useCaseStore()
const progressStore = useProgressStore()
const gameStore = useGameStore()
const loading = ref(true)
const error = ref<string | null>(null)
const persistenceNotice = ref('')
const sessionStatus = ref('CONNECTING')
let completionRecorded = false
let serverSessionId: string | null = null

onMounted(async () => {
  try {
    progressStore.loadProgress()
    const caseSlug = route.params.caseSlug as string
    const [definition, cases] = await Promise.all([fetchCase(caseSlug), fetchCases()])
    const previousCase = cases.find(item => item.order === definition.order - 1)
    const hasUnresolvedPredecessor = cases.some(item =>
      item.order < definition.order && !progressStore.isCaseCompleted(item.id)
    )
    if (definition.order > 1 && (!previousCase || hasUnresolvedPredecessor)) {
      throw new Error('This incident is locked. Resolve the previous case from the mission docket first.')
    }
    caseStore.loadCase(definition)
    gameStore.startGame(definition.slug)
    await startServerSession(definition.id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'An unexpected error occurred while loading this incident.'
  } finally {
    loading.value = false
  }
})

watch(() => caseStore.isCompleted, async completed => {
  const definition = caseStore.caseDefinition
  if (!completed || !definition || completionRecorded) return

  completionRecorded = true
  const result = calculateScore({
    elapsedMs: caseStore.elapsedTime,
    attempts: caseStore.attempts,
    hintsUsed: caseStore.hintsUsed
  })
  const elapsedMs = caseStore.elapsedTime
  const savedLocally = progressStore.completeCase(
    definition.id,
    result.score,
    elapsedMs,
    caseStore.attempts,
    caseStore.hintsUsed
  )
  if (!savedLocally) persistenceNotice.value = progressStore.persistenceError || 'Local progress could not be saved.'

  if (serverSessionId) {
    try {
      await completeSession(serverSessionId, {
        score: result.score,
        attempts: caseStore.attempts,
        hintsUsed: caseStore.hintsUsed
      })
      persistenceNotice.value = ''
    } catch (cause) {
      console.error('Failed to record completed game session:', cause)
      persistenceNotice.value = cause instanceof Error
        ? `Progress is saved locally, but the server could not record this run: ${cause.message}`
        : 'Progress is saved locally, but the server could not record this run.'
    }
  }

  await router.replace({
    name: 'result',
    params: { caseSlug: definition.slug },
    query: {
      time: String(elapsedMs),
      attempts: String(caseStore.attempts),
      hints: String(caseStore.hintsUsed),
      score: String(result.score),
      rating: result.rating
    }
  })
})

onBeforeUnmount(() => {
  caseStore.stopTimer()
  gameStore.stopGame()
})

function selectTool(tool: ToolDefinition['type']) {
  gameStore.setActiveTool(tool)
  caseStore.setCurrentTool(tool)
}

function toolIcon(tool: ToolDefinition['type']): string {
  const icons: Record<ToolDefinition['type'], string> = {
    console: '⌘',
    network: '◉',
    files: '▧',
    inspector: '▣'
  }
  return icons[tool] || '·'
}

async function startServerSession(caseId: string) {
  try {
    const result = await createSession(caseId)
    if (!result.data || typeof result.data.sessionId !== 'string') {
      throw new Error('The server returned an invalid session identifier.')
    }
    serverSessionId = result.data.sessionId
    sessionStatus.value = 'PERSISTED'
    persistenceNotice.value = ''
  } catch (cause) {
    console.error('Could not create server game session:', cause)
    sessionStatus.value = 'LOCAL ONLY'
    persistenceNotice.value = cause instanceof Error
      ? `The sandbox session is running locally; server recording is unavailable: ${cause.message}`
      : 'The sandbox session is running locally; server recording is unavailable.'
  }
}

async function resetLab() {
  caseStore.resetCase()
  gameStore.startGame(caseStore.caseDefinition?.slug || '')
  sessionStatus.value = 'CONNECTING'
  serverSessionId = null
  completionRecorded = false
  if (caseStore.caseDefinition) await startServerSession(caseStore.caseDefinition.id)
}
</script>

<style scoped>
.game-page { min-height: 100vh; height: 100vh; display: flex; flex-direction: column; background: var(--color-canvas-root); overflow: hidden; }
.station-layout { min-height: 0; flex: 1; display: flex; }
.tool-rail { width: 205px; flex: 0 0 205px; display: flex; flex-direction: column; gap: .3rem; padding: .75rem; background: #080b10; border-right: 1px solid var(--color-hairline-stroke); }
.rail-title { color: var(--color-primary); padding: .35rem .4rem .8rem; border-bottom: 1px solid var(--color-hairline-stroke); }
.rail-item { min-height: 35px; padding: 0 .45rem; display: flex; align-items: center; gap: .55rem; border: 0; background: transparent; text-align: left; color: var(--color-text-muted); font: 10px var(--font-mono); cursor: pointer; }
.rail-item:hover, .rail-item.active { background: var(--color-surface-raised); color: var(--color-text-primary); }
.rail-item.active { border-left: 2px solid var(--color-primary); }
.rail-item.reset-lab { margin-top: .4rem; border-top: 1px solid var(--color-hairline-stroke); }
.rail-spacer { flex: 1; }
.rail-exit { padding: .6rem .4rem; color: var(--color-text-ghost); border-top: 1px solid var(--color-hairline-stroke); text-decoration: none; font: 9px var(--font-mono); }
.rail-exit:hover { color: var(--color-primary); }
.workbench { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.session-bar { height: 30px; display: flex; align-items: center; justify-content: space-between; gap: .8rem; padding: 0 .8rem; background: #0d1218; border-bottom: 1px solid var(--color-hairline-stroke); color: var(--color-text-muted); font: 8px var(--font-mono); white-space: nowrap; }
.session-bar span:first-child { color: var(--color-text-primary); }
.session-bar b { color: var(--color-primary); font-weight: 500; }
.session-bar i { width: 6px; height: 6px; display: inline-block; border-radius: 50%; background: var(--color-secondary); }
.persistence-notice { padding: .5rem .8rem; border-bottom: 1px solid var(--color-amber-border); background: var(--color-amber-dim); color: var(--color-amber); font: 9px/1.5 var(--font-mono); }
.game-content { min-height: 0; flex: 1; display: flex; overflow: hidden; }
.page-state { flex: 1; display: grid; place-content: center; gap: .8rem; color: var(--color-primary); font: 11px var(--font-mono); text-align: center; }
.page-state.error { color: var(--color-tertiary); }
.page-state a { color: var(--color-primary); }
@media (max-width: 820px) { .game-page { height: auto; min-height: 100vh; overflow: visible; } .station-layout { flex-direction: column; } .tool-rail { width: 100%; flex: 0 0 auto; flex-direction: row; overflow: auto; } .rail-title { display: none; } .rail-item { white-space: nowrap; } .rail-spacer, .rail-exit { display: none; } .session-bar { overflow: auto; } .session-bar span { flex: 0 0 auto; } .game-content { min-height: 550px; flex-direction: column; overflow: visible; } }
</style>
