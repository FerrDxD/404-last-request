import {
  isCaseDefinition,
  type CaseMetadata,
  type CaseResponse,
  type CasesResponse,
  type CompleteSessionRequest,
  type CompleteSessionResponse,
  type SessionCreatedResponse
} from '@404-last-request/shared'

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers
      }
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Network request failed.'
    throw new ApiClientError(`The game server could not be reached. ${reason}`, 0)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new ApiClientError(
      response.ok ? 'The game server returned invalid JSON.' : `The game server request failed (${response.status}).`,
      response.status
    )
  }

  if (!response.ok) {
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const apiError = body.error
      if (typeof apiError === 'object' && apiError !== null) {
        const details = apiError as { message?: unknown; code?: unknown }
        if (typeof details.message === 'string') {
          throw new ApiClientError(
            details.message,
            response.status,
            typeof details.code === 'string' ? details.code : undefined
          )
        }
      }
    }
    throw new ApiClientError(`The game server request failed (${response.status}).`, response.status)
  }

  return body as T
}

export async function fetchCases(): Promise<CaseMetadata[]> {
  const result = await requestJson<CasesResponse>('/api/cases')
  if (!Array.isArray(result.data) || !result.data.every(isCaseMetadata)) {
    throw new ApiClientError('The case archive returned invalid case metadata.', 502)
  }
  return result.data
}

export async function fetchCase(slug: string): Promise<CaseResponse['data']> {
  const result = await requestJson<CaseResponse>(`/api/cases/${encodeURIComponent(slug)}`)
  if (!isCaseDefinition(result.data)) {
    throw new ApiClientError('This case has invalid or incomplete game content.', 502)
  }
  return result.data
}

export function createSession(caseId: string): Promise<SessionCreatedResponse> {
  return requestJson<SessionCreatedResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ caseId })
  })
}

export function completeSession(
  sessionId: string,
  completion: CompleteSessionRequest
): Promise<CompleteSessionResponse> {
  return requestJson<CompleteSessionResponse>(`/api/sessions/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
    body: JSON.stringify(completion)
  })
}

function isCaseMetadata(value: unknown): value is CaseMetadata {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'slug' in value && typeof value.slug === 'string' &&
    'title' in value && typeof value.title === 'string' &&
    'description' in value && typeof value.description === 'string' &&
    'difficulty' in value && Number.isInteger(value.difficulty) &&
    Number(value.difficulty) >= 1 && Number(value.difficulty) <= 5 &&
    'order' in value && Number.isInteger(value.order) && Number(value.order) >= 1
}
