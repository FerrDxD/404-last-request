import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CaseDefinition, CaseState, EvaluationResult, GameAction, VirtualFile } from '@404-last-request/shared'
import { evaluateCase } from '@/game/engine/evaluator'

export const useCaseStore = defineStore('case', () => {
  const caseDefinition = ref<CaseDefinition | null>(null)
  const caseState = ref<CaseState | null>(null)
  const evaluationResult = ref<EvaluationResult | null>(null)
  const elapsedTime = ref(0)
  let startTime = 0
  let timerInterval: number | null = null

  const isCompleted = computed(() => caseState.value?.completed ?? false)
  const attempts = computed(() => caseState.value?.attempts ?? 0)
  const hintsUsed = computed(() => caseState.value?.hintsUsed ?? 0)

  function stopTimer(): void {
    if (timerInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(timerInterval)
    }
    timerInterval = null
  }

  function loadCase(definition: CaseDefinition): void {
    stopTimer()
    caseDefinition.value = definition
    startTime = Date.now()
    elapsedTime.value = 0
    evaluationResult.value = null
    caseState.value = {
      caseId: definition.id,
      startedAt: startTime,
      currentTool: 'console',
      inspectedEvidence: [],
      inspectedElementId: null,
      usedHintIds: [],
      modifiedValues: {},
      attempts: 0,
      hintsUsed: 0,
      completed: false
    }

    if (typeof window !== 'undefined') {
      timerInterval = window.setInterval(() => {
        if (caseState.value && !caseState.value.completed) {
          elapsedTime.value = Date.now() - startTime
        }
      }, 250)
    }
  }

  function applyAction(action: GameAction): void {
    const definition = caseDefinition.value
    const state = caseState.value
    if (!definition || !state || state.completed) return

    switch (action.type) {
      case 'inspect': {
        const evidence = definition.content.evidence.find(item => item.id === action.elementId)
        if (!evidence) return
        if (!state.inspectedEvidence.includes(evidence.id)) state.inspectedEvidence.push(evidence.id)
        state.inspectedElementId = evidence.id
        if (evidence.type === 'console' || evidence.type === 'network' || evidence.type === 'file' || evidence.type === 'inspector') {
          state.currentTool = evidence.type === 'file' ? 'files' : evidence.type
        }
        break
      }

      case 'openFile': {
        const evidence = definition.content.evidence.find(item => {
          if (item.type !== 'file' || typeof item.content !== 'object' || item.content === null) return false
          return (item.content as VirtualFile).path === action.filePath
        })
        if (!evidence) return
        if (!state.inspectedEvidence.includes(evidence.id)) state.inspectedEvidence.push(evidence.id)
        state.inspectedElementId = evidence.id
        state.currentTool = 'files'
        break
      }

      case 'changeValue': {
        const actionDefinition = definition.content.actions.find(item => item.type === 'modify' && item.target === action.target)
        if (!actionDefinition?.allowedValues?.some(value => Object.is(value, action.value))) return
        state.modifiedValues[action.target] = action.value
        evaluationResult.value = null
        break
      }

      case 'useHint': {
        const hint = definition.content.hints.find(item => item.id === action.hintId)
        if (!hint || state.usedHintIds.includes(hint.id)) return
        state.usedHintIds.push(hint.id)
        state.hintsUsed = state.usedHintIds.length
        break
      }

      case 'sendRequest': {
        const evidence = definition.content.evidence.find(item => {
          if (item.type !== 'network' || typeof item.content !== 'object' || item.content === null) return false
          const request = item.content as Record<string, unknown>
          return request.method === action.method && request.url === action.url
        })
        if (evidence && !state.inspectedEvidence.includes(evidence.id)) state.inspectedEvidence.push(evidence.id)
        if (evidence) state.inspectedElementId = evidence.id
        state.currentTool = 'network'
        break
      }

      case 'runTest':
        state.attempts += 1
        evaluationResult.value = evaluateCase(definition, state)
        if (evaluationResult.value.status === 'success') completeCase()
        break
    }
  }

  function evaluate(): EvaluationResult | null {
    const definition = caseDefinition.value
    const state = caseState.value
    if (!definition || !state || state.completed) return evaluationResult.value
    evaluationResult.value = evaluateCase(definition, state)
    if (evaluationResult.value.status === 'success') completeCase()
    return evaluationResult.value
  }

  function completeCase(): void {
    const state = caseState.value
    if (!state || state.completed) return
    elapsedTime.value = Math.max(0, Date.now() - startTime)
    state.completed = true
    stopTimer()
  }

  function resetCase(): void {
    if (caseDefinition.value) loadCase(caseDefinition.value)
  }

  function getHint(level: number) {
    if (!Number.isInteger(level) || level < 1 || level > 3) return null
    return caseDefinition.value?.content.hints.find(hint => hint.level === level) || null
  }

  function setCurrentTool(tool: CaseState['currentTool']): void {
    if (caseState.value && caseDefinition.value?.content.tools.some(item => item.type === tool)) {
      caseState.value.currentTool = tool
    }
  }

  return {
    caseDefinition,
    caseState,
    evaluationResult,
    elapsedTime,
    isCompleted,
    attempts,
    hintsUsed,
    loadCase,
    applyAction,
    evaluate,
    completeCase,
    resetCase,
    getHint,
    setCurrentTool,
    stopTimer
  }
})
