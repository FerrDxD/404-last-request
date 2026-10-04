import type { CaseDefinition, CaseMetadata } from './case.js'

// API Request/Response Types

export interface CasesResponse {
  data: CaseMetadata[]
}

export interface CaseResponse {
  data: CaseDefinition
}

export type CaseWithContent = CaseDefinition

export interface CreateSessionRequest {
  caseId: string
}

export interface CreateSessionResponse {
  data: {
    sessionId: string
  }
}

export interface CompleteSessionRequest {
  score: number
  attempts: number
  hintsUsed: number
}

export interface CompleteSessionResponse {
  data: {
    sessionId: string
    score: number
  }
}

export interface SessionCreatedResponse {
  data: {
    sessionId: string
  }
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

// API Error Codes

export enum ApiErrorCode {
  CASE_NOT_FOUND = 'CASE_NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
