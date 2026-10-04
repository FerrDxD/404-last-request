export interface CaseMetadata {
  id: string
  slug: string
  title: string
  description: string
  difficulty: number
  order: number
}

export interface CaseDefinition extends CaseMetadata {
  content: CaseContent
}

export interface CaseContent {
  objective: ObjectiveDefinition
  application: ApplicationDefinition
  tools: ToolDefinition[]
  evidence: EvidenceDefinition[]
  actions: ActionDefinition[]
  solution: SolutionDefinition
  hints: HintDefinition[]
}

export interface ObjectiveDefinition {
  description: string
}

export interface ApplicationDefinition {
  initialRoute: string
  brand?: string
  environment?: string
  screen?: SimulatedScreenDefinition
  components?: ComponentDefinition[]
}

export interface SimulatedScreenDefinition {
  icon: string
  eyebrow: string
  title: string
  description: string
  status: string
  statusTone: 'danger' | 'warning' | 'success' | 'info'
  notice: string
  request: {
    method: string
    url: string
    status: number
  }
  metrics: Array<{
    label: string
    value: string
  }>
  fields?: Array<{
    label: string
    value: string
    type?: 'text' | 'email' | 'password'
  }>
  actionLabel: string
  interactionResult: string
}

export interface ComponentDefinition {
  id: string
  type: string
  props?: Record<string, unknown>
}

export interface ToolDefinition {
  id: string
  name: string
  type: 'console' | 'network' | 'files' | 'inspector'
}

export interface EvidenceDefinition {
  id: string
  type: 'console' | 'network' | 'file' | 'inspector'
  content: unknown
  unlockCondition?: string
}

export interface ActionDefinition {
  id: string
  type: 'inspect' | 'modify' | 'run' | 'navigate'
  target: string
  allowedValues?: unknown[]
}

export interface SolutionDefinition {
  requiredChanges: RequiredChange[]
  incompleteMessage?: string
  failureMessage?: string
  successMessage?: string
}

export interface RequiredChange {
  target: string
  value: unknown
}

export interface HintDefinition {
  id: string
  level: 1 | 2 | 3
  text: string
}

export interface CaseState {
  caseId: string
  startedAt: number
  currentTool: ToolDefinition['type']
  inspectedEvidence: string[]
  inspectedElementId: string | null
  usedHintIds: string[]
  modifiedValues: Record<string, unknown>
  attempts: number
  hintsUsed: number
  completed: boolean
}

export interface EvaluationResult {
  status: 'incomplete' | 'failed' | 'success'
  message?: string
  feedback?: FeedbackDefinition[]
  unlockedEvidence?: string[]
}

export interface FeedbackDefinition {
  type: 'error' | 'warning' | 'info'
  message: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasString(record: Record<string, unknown>, key: string): boolean {
  return typeof record[key] === 'string' && record[key].length > 0
}

export function isCaseDefinition(value: unknown): value is CaseDefinition {
  if (!isRecord(value) || !isRecord(value.content)) return false
  const content = value.content
  if (!hasString(value, 'id') || !hasString(value, 'slug') || !hasString(value, 'title') ||
      !hasString(value, 'description') || !Number.isInteger(value.difficulty) ||
      Number(value.difficulty) < 1 || Number(value.difficulty) > 5 ||
      !Number.isInteger(value.order) || Number(value.order) < 1 || !isRecord(content.objective) ||
      !hasString(content.objective, 'description') || !isRecord(content.application) ||
      !hasString(content.application, 'initialRoute') || !Array.isArray(content.tools) ||
      !Array.isArray(content.evidence) || !Array.isArray(content.actions) ||
      !Array.isArray(content.hints) || content.hints.length !== 3 || !isRecord(content.solution) ||
      !Array.isArray(content.solution.requiredChanges)) return false

  const toolIds = new Set<string>()
  const toolTypes = new Set<string>()
  for (const tool of content.tools) {
    if (!isRecord(tool) || !hasString(tool, 'id') || !hasString(tool, 'name') ||
        !['console', 'network', 'files', 'inspector'].includes(String(tool.type)) ||
        toolIds.has(tool.id as string) || toolTypes.has(tool.type as string)) return false
    toolIds.add(tool.id as string)
    toolTypes.add(tool.type as string)
  }
  if (!['console', 'network', 'files', 'inspector'].every(type => toolTypes.has(type))) return false

  const evidenceIds = new Set<string>()
  const evidenceTypes = new Set<string>()
  for (const evidence of content.evidence) {
    if (!isRecord(evidence) || !hasString(evidence, 'id') ||
        !['console', 'network', 'file', 'inspector'].includes(String(evidence.type)) ||
        !('content' in evidence) || evidenceIds.has(evidence.id as string)) return false
    evidenceIds.add(evidence.id as string)
    evidenceTypes.add(evidence.type as string)
    if (evidence.type === 'console') {
      if (!isRecord(evidence.content) || !hasString(evidence.content, 'message') ||
          !['log', 'info', 'warn', 'error'].includes(String(evidence.content.level)) ||
          (evidence.content.timestamp !== undefined && !Number.isFinite(evidence.content.timestamp))) return false
    }
    if (evidence.type === 'network') {
      if (!isRecord(evidence.content) || !hasString(evidence.content, 'id') ||
          !hasString(evidence.content, 'method') || !hasString(evidence.content, 'url') ||
          !Number.isInteger(evidence.content.status) || Number(evidence.content.status) < 100 ||
          Number(evidence.content.status) > 599 ||
          (evidence.content.duration !== undefined &&
            (!Number.isFinite(evidence.content.duration) || Number(evidence.content.duration) < 0))) return false
    }
    if (evidence.type === 'file') {
      if (!isRecord(evidence.content) || !hasString(evidence.content, 'path') ||
          !hasString(evidence.content, 'content') ||
          !['code', 'config', 'documentation'].includes(String(evidence.content.type))) return false
    }
    if (evidence.type === 'inspector') {
      if (!isRecord(evidence.content) || !hasString(evidence.content, 'id') ||
          !hasString(evidence.content, 'tag') || !isRecord(evidence.content.attributes) ||
          !Object.values(evidence.content.attributes).every(item => typeof item === 'string') ||
          (evidence.content.events !== undefined &&
            (!Array.isArray(evidence.content.events) || !evidence.content.events.every(item => typeof item === 'string'))) ||
          (evidence.content.state !== undefined && !isRecord(evidence.content.state))) return false
    }
  }
  if (!['console', 'network', 'file', 'inspector'].every(type => evidenceTypes.has(type))) return false

  const actionTargets = new Set<string>()
  const actionIds = new Set<string>()
  for (const action of content.actions) {
    if (!isRecord(action) || !hasString(action, 'id') || !hasString(action, 'target') ||
        !['inspect', 'modify', 'run', 'navigate'].includes(String(action.type)) ||
        actionTargets.has(action.target as string) || actionIds.has(action.id as string)) return false
    actionTargets.add(action.target as string)
    actionIds.add(action.id as string)
    if (action.allowedValues !== undefined &&
        (!Array.isArray(action.allowedValues) || action.allowedValues.length === 0)) return false
    if (action.type === 'modify' && (!Array.isArray(action.allowedValues) || action.allowedValues.length === 0)) return false
  }

  const requiredTargets = new Set<string>()
  for (const change of content.solution.requiredChanges) {
    if (!isRecord(change) || !hasString(change, 'target') || !actionTargets.has(change.target as string) ||
        requiredTargets.has(change.target as string)) return false
    requiredTargets.add(change.target as string)
    const action = content.actions.find(item => isRecord(item) && item.target === change.target)
    if (!isRecord(action) || action.type !== 'modify' || !Array.isArray(action.allowedValues) ||
        !action.allowedValues.some(item => Object.is(item, change.value))) return false
  }

  const hintLevels = new Set<number>()
  const hintIds = new Set<string>()
  for (const hint of content.hints) {
    if (!isRecord(hint) || !hasString(hint, 'id') || !hasString(hint, 'text') ||
        !Number.isInteger(hint.level) || Number(hint.level) < 1 || Number(hint.level) > 3 ||
        hintLevels.has(Number(hint.level)) || hintIds.has(hint.id as string)) return false
    hintLevels.add(Number(hint.level))
    hintIds.add(hint.id as string)
  }

  if (content.application.components !== undefined) {
    if (!Array.isArray(content.application.components)) return false
    const componentIds = new Set<string>()
    for (const component of content.application.components) {
      if (!isRecord(component) || !hasString(component, 'id') || !hasString(component, 'type') ||
          componentIds.has(component.id as string) ||
          (component.props !== undefined && !isRecord(component.props))) return false
      componentIds.add(component.id as string)
    }
  }

  if (content.application.screen !== undefined) {
    const screen = content.application.screen
    if (!isRecord(screen) || !hasString(screen, 'icon') || !hasString(screen, 'eyebrow') ||
        !hasString(screen, 'title') || !hasString(screen, 'description') ||
        !hasString(screen, 'status') || !hasString(screen, 'notice') ||
        !hasString(screen, 'actionLabel') || !hasString(screen, 'interactionResult') ||
        !isRecord(screen.request) || !hasString(screen.request, 'method') ||
        !hasString(screen.request, 'url') || !Number.isInteger(screen.request.status) ||
        !Array.isArray(screen.metrics) || !screen.metrics.every(metric =>
          isRecord(metric) && hasString(metric, 'label') && hasString(metric, 'value')) ||
        !['danger', 'warning', 'success', 'info'].includes(String(screen.statusTone))) return false
    if (screen.fields !== undefined) {
      if (!Array.isArray(screen.fields) || !screen.fields.every(field =>
        isRecord(field) && hasString(field, 'label') && typeof field.value === 'string' &&
        (field.type === undefined || ['text', 'email', 'password'].includes(String(field.type))))) return false
    }
  }

  for (const key of ['incompleteMessage', 'failureMessage', 'successMessage']) {
    if (content.solution[key] !== undefined && typeof content.solution[key] !== 'string') return false
  }

  return content.solution.requiredChanges.length > 0
}
