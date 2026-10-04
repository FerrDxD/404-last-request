import { defineStore } from 'pinia'
import { ref } from 'vue'

interface SavedProgress {
  version: 1
  completedCases: string[]
  bestScores: Record<string, number>
  bestTimes: Record<string, number>
  attemptCounts: Record<string, number>
  hintUsage: Record<string, number>
  settings: {
    sound: boolean
    reducedMotion: boolean
  }
}

type ProgressSettings = SavedProgress['settings']

const STORAGE_KEY = 'gameProgress'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.values(value).every(item => Number.isFinite(item) && Number(item) >= 0)
}

function isSavedProgress(value: unknown): value is Partial<SavedProgress> & Pick<SavedProgress, 'completedCases'> {
  if (!isRecord(value) || !Array.isArray(value.completedCases) || !value.completedCases.every(item => typeof item === 'string')) {
    return false
  }
  if (value.bestScores !== undefined && !isNumberRecord(value.bestScores)) return false
  if (value.bestTimes !== undefined && !isNumberRecord(value.bestTimes)) return false
  if (value.attemptCounts !== undefined && !isNumberRecord(value.attemptCounts)) return false
  if (value.hintUsage !== undefined && !isNumberRecord(value.hintUsage)) return false
  if (value.settings !== undefined) {
    if (!isRecord(value.settings) ||
        (value.settings.sound !== undefined && typeof value.settings.sound !== 'boolean') ||
        (value.settings.reducedMotion !== undefined && typeof value.settings.reducedMotion !== 'boolean')) return false
  }
  return true
}

export const useProgressStore = defineStore('progress', () => {
  const completedCases = ref<string[]>([])
  const bestScores = ref<Record<string, number>>({})
  const bestTimes = ref<Record<string, number>>({})
  const attemptCounts = ref<Record<string, number>>({})
  const hintUsage = ref<Record<string, number>>({})
  const settings = ref<ProgressSettings>({
    sound: true,
    reducedMotion: false
  })
  const persistenceError = ref<string | null>(null)

  function loadProgress(): boolean {
    if (typeof localStorage === 'undefined') return false

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return true

      const parsed: unknown = JSON.parse(stored)
      if (!isSavedProgress(parsed)) {
        throw new Error('Saved progress has an invalid format.')
      }

      completedCases.value = [...new Set(parsed.completedCases)]
      bestScores.value = parsed.bestScores || {}
      bestTimes.value = parsed.bestTimes || {}
      attemptCounts.value = parsed.attemptCounts || {}
      hintUsage.value = parsed.hintUsage || {}
      settings.value = { ...settings.value, ...parsed.settings }
      persistenceError.value = null
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown storage error.'
      console.error('Failed to load saved game progress:', error)
      persistenceError.value = `Saved progress could not be loaded: ${message}`
      completedCases.value = []
      bestScores.value = {}
      bestTimes.value = {}
      attemptCounts.value = {}
      hintUsage.value = {}
      return false
    }
  }

  function saveProgress(): boolean {
    if (typeof localStorage === 'undefined') {
      persistenceError.value = 'Local saving is not available in this browser context.'
      return false
    }

    const progress: SavedProgress = {
      version: 1,
      completedCases: completedCases.value,
      bestScores: bestScores.value,
      bestTimes: bestTimes.value,
      attemptCounts: attemptCounts.value,
      hintUsage: hintUsage.value,
      settings: settings.value
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      persistenceError.value = null
      return true
    } catch (error) {
      console.error('Failed to save game progress:', error)
      persistenceError.value = 'Your browser could not save progress. Check available storage and privacy settings.'
      return false
    }
  }

  function resetProgress(): boolean {
    completedCases.value = []
    bestScores.value = {}
    bestTimes.value = {}
    attemptCounts.value = {}
    hintUsage.value = {}
    return saveProgress()
  }

  function completeCase(caseId: string, score: number, time: number, attempts: number, hints: number): boolean {
    if (!caseId || !Number.isFinite(score) || score < 0 || !Number.isFinite(time) || time < 0 ||
        !Number.isInteger(attempts) || attempts < 1 || !Number.isInteger(hints) || hints < 0) {
      throw new Error('Cannot save an invalid case completion record.')
    }

    if (!completedCases.value.includes(caseId)) completedCases.value.push(caseId)
    if (bestScores.value[caseId] === undefined || score > bestScores.value[caseId]) bestScores.value[caseId] = score
    if (bestTimes.value[caseId] === undefined || time < bestTimes.value[caseId]) bestTimes.value[caseId] = time
    attemptCounts.value[caseId] = attempts
    hintUsage.value[caseId] = hints
    return saveProgress()
  }

  function isCaseCompleted(caseId: string): boolean {
    return completedCases.value.includes(caseId)
  }

  function getBestScore(caseId: string): number | undefined {
    return bestScores.value[caseId]
  }

  function getBestTime(caseId: string): number | undefined {
    return bestTimes.value[caseId]
  }

  function updateSettings(newSettings: Partial<ProgressSettings>): boolean {
    settings.value = { ...settings.value, ...newSettings }
    return saveProgress()
  }

  return {
    completedCases,
    bestScores,
    bestTimes,
    attemptCounts,
    hintUsage,
    settings,
    persistenceError,
    loadProgress,
    saveProgress,
    resetProgress,
    completeCase,
    isCaseCompleted,
    getBestScore,
    getBestTime,
    updateSettings
  }
})
