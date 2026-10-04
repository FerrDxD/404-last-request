import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToolDefinition } from '@404-last-request/shared'

const toolTypes: ToolDefinition['type'][] = ['console', 'network', 'files', 'inspector']

export const useGameStore = defineStore('game', () => {
  const isRunning = ref(false)
  const currentCaseSlug = ref<string | null>(null)
  const activeTool = ref<ToolDefinition['type']>('console')

  function startGame(caseSlug: string): void {
    currentCaseSlug.value = caseSlug
    isRunning.value = true
    activeTool.value = 'console'
  }

  function stopGame(): void {
    currentCaseSlug.value = null
    isRunning.value = false
    activeTool.value = 'console'
  }

  function setActiveTool(tool: string): void {
    if (toolTypes.includes(tool as ToolDefinition['type'])) {
      activeTool.value = tool as ToolDefinition['type']
    }
  }

  return {
    isRunning,
    currentCaseSlug,
    activeTool,
    startGame,
    stopGame,
    setActiveTool
  }
})
