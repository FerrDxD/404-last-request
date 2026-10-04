<template>
  <footer class="game-status-bar">
    <div class="objective">
      <span class="label-mono objective-label">OBJECTIVE</span>
      <span>{{ caseDefinition?.content.objective.description }}</span>
    </div>
    <div class="patch-actions">
      <label v-for="action in patchActions" :key="action.target" class="patch-field">
        <span class="label-mono">{{ action.target }}</span>
        <select
          class="input"
          :value="currentValue(action.target)"
          :disabled="caseStore.isCompleted"
          @change="stagePatch(action.target, $event)"
        >
          <option value="" disabled>Choose a fix…</option>
          <option v-for="value in action.allowedValues || []" :key="String(value)" :value="String(value)">
            {{ value }}
          </option>
        </select>
      </label>
      <button class="btn btn-amber" :disabled="caseStore.isCompleted" @click="showHint">
        Hint <span>{{ hintsUsed }}/{{ availableHints }}</span>
      </button>
      <button class="btn btn-primary run-button" :disabled="caseStore.isCompleted" @click="runTest">⚡ Run test</button>
    </div>
    <div v-if="hintMessage || testMessage" class="feedback" :class="feedbackType" role="status">
      {{ hintMessage || testMessage }}
      <button type="button" aria-label="Dismiss message" @click="dismissFeedback">×</button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCaseStore } from '@/stores/case.store'

const caseStore = useCaseStore()
const caseDefinition = computed(() => caseStore.caseDefinition)
const hintsUsed = computed(() => caseStore.hintsUsed)
const availableHints = computed(() => caseDefinition.value?.content.hints.length || 0)
const patchActions = computed(() => caseDefinition.value?.content.actions.filter(action => action.type === 'modify') || [])
const hintMessage = ref('')
const testMessage = ref('')
const feedbackType = ref('info')

watch(() => caseDefinition.value?.slug, dismissFeedback)

function showHint() {
  const nextHint = hintsUsed.value + 1
  const hint = caseStore.getHint(nextHint)
  if (!hint) {
    hintMessage.value = 'No more hints are available for this incident.'
    feedbackType.value = 'warning'
    return
  }

  caseStore.applyAction({ type: 'useHint', hintId: hint.id })
  hintMessage.value = `HINT ${nextHint} // ${hint.text}`
  feedbackType.value = 'warning'
  testMessage.value = ''
}

function currentValue(target: string): string {
  const value = caseStore.caseState?.modifiedValues[target]
  return value === undefined ? '' : String(value)
}

function stagePatch(target: string, event: Event) {
  const selected = (event.target as HTMLSelectElement).value
  const action = patchActions.value.find(item => item.target === target)
  const value = action?.allowedValues?.find(option => String(option) === selected)
  if (value === undefined) return
  caseStore.applyAction({ type: 'changeValue', target, value })
  dismissFeedback()
}

function runTest() {
  caseStore.applyAction({ type: 'runTest' })
  hintMessage.value = ''
  testMessage.value = caseStore.evaluationResult?.message || 'No test result is available.'
  feedbackType.value = caseStore.evaluationResult?.status === 'failed' ? 'error' : 'info'
}

function dismissFeedback() {
  hintMessage.value = ''
  testMessage.value = ''
}
</script>

<style scoped>
.game-status-bar { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .6rem 1rem; background: #10151c; border-top: 1px solid var(--color-hairline-stroke); }
.objective { display: flex; flex-direction: column; gap: .2rem; min-width: 0; max-width: 35%; color: var(--color-text-muted); font-size: 10px; }
.objective-label { color: var(--color-text-ghost); }
.patch-actions { display: flex; align-items: flex-end; gap: .45rem; }
.patch-field { width: min(190px, 18vw); display: flex; flex-direction: column; gap: .25rem; }
.patch-field .label-mono { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-muted); font-size: 8px; }
.patch-field .input { width: 100%; padding: .25rem .4rem; font-size: 10px; height: 29px; }
.patch-actions .btn { white-space: nowrap; font-size: 9px; }
.patch-actions .btn:disabled { cursor: not-allowed; opacity: .6; }
.patch-actions .btn-amber span { opacity: .75; }
.run-button { min-height: 34px; padding-inline: .8rem; }
.feedback { position: absolute; right: 1rem; bottom: calc(100% + .5rem); max-width: min(560px, 90vw); padding: .7rem .8rem; display: flex; gap: .8rem; align-items: flex-start; background: var(--color-surface-float); border: 1px solid var(--color-primary-border); box-shadow: 0 8px 28px #0008; color: var(--color-text-primary); font: 10px/1.5 var(--font-mono); }
.feedback button { border: 0; background: none; color: var(--color-text-muted); cursor: pointer; font-size: 17px; line-height: 12px; }
.feedback.error { border-color: var(--color-tertiary-border); }
.feedback.warning { border-color: var(--color-amber-border); color: var(--color-amber); }
.feedback.success { border-color: var(--color-secondary-border); color: var(--color-secondary); }
@media (max-width: 1050px) { .game-status-bar { align-items: stretch; flex-direction: column; } .objective { max-width: none; } .patch-actions { flex-wrap: wrap; } .patch-field { width: auto; flex: 1 1 200px; } }
</style>
