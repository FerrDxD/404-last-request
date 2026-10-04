// Game Action Types

export type GameAction =
  | InspectElementAction
  | OpenFileAction
  | ChangeValueAction
  | RunTestAction
  | SendRequestAction
  | UseHintAction

export interface InspectElementAction {
  type: 'inspect'
  elementId: string
}

export interface OpenFileAction {
  type: 'openFile'
  filePath: string
}

export interface ChangeValueAction {
  type: 'changeValue'
  target: string
  value: unknown
}

export interface RunTestAction {
  type: 'runTest'
}

export interface SendRequestAction {
  type: 'sendRequest'
  method: string
  url: string
  data?: unknown
}

export interface UseHintAction {
  type: 'useHint'
  hintId: string
}

// Tool View State

export interface ToolViewState {
  toolId: string
  data: unknown
}

// Console Types

export interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error'
  message: string
  timestamp?: number
}

// Network Types

export interface NetworkRequest {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  status: number
  request?: unknown
  response?: unknown
  duration?: number
}

// File Types

export interface VirtualFile {
  path: string
  content: string
  type: 'code' | 'config' | 'documentation'
}

// Inspector Types

export interface InspectableElement {
  id: string
  tag: string
  attributes: Record<string, string>
  events?: string[]
  state?: Record<string, unknown>
}

// Scoring Types

export interface ScoreInput {
  elapsedMs: number
  attempts: number
  hintsUsed: number
}

export interface ScoreResult {
  score: number
  rating: string
  breakdown: {
    base: number
    timePenalty: number
    attemptPenalty: number
    hintPenalty: number
  }
}
