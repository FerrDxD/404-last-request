import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { CaseDefinition, CaseState } from '@404-last-request/shared'
import { caseDefinitions } from './cases'
import { evaluateCase } from '../../web/src/game/engine/evaluator'

function createState(caseDefinition: CaseDefinition, modifiedValues: Record<string, unknown> = {}): CaseState {
  return {
    caseId: caseDefinition.id,
    startedAt: 0,
    currentTool: 'console',
    inspectedEvidence: [],
    inspectedElementId: null,
    usedHintIds: [],
    modifiedValues,
    attempts: 0,
    hintsUsed: 0,
    completed: false
  }
}

test('returns incomplete until every required change has been staged', () => {
  for (const definition of caseDefinitions) {
    const result = evaluateCase(definition, createState(definition))
    assert.equal(result.status, 'incomplete', definition.slug)
  }
})

test('rejects an incorrect staged value', () => {
  for (const definition of caseDefinitions) {
    const change = definition.content.solution.requiredChanges[0]
    const action = definition.content.actions.find(item => item.target === change.target)
    assert.ok(action?.allowedValues)
    const incorrectValue = action.allowedValues.find(value => !Object.is(value, change.value))
    assert.notEqual(incorrectValue, undefined, `${definition.slug} must provide a wrong choice`)
    assert.equal(
      evaluateCase(definition, createState(definition, { [change.target]: incorrectValue })).status,
      'failed',
      definition.slug
    )
  }
})

test('accepts a case only when all required changes match', () => {
  for (const definition of caseDefinitions) {
    const modifiedValues = Object.fromEntries(
      definition.content.solution.requiredChanges.map(change => [change.target, change.value])
    )
    assert.equal(evaluateCase(definition, createState(definition, modifiedValues)).status, 'success', definition.slug)
  }
})

test('keeps partially staged multi-patch cases incomplete', () => {
  const definition = caseDefinitions.find(item => item.content.solution.requiredChanges.length > 1)
  assert.ok(definition)
  const [firstChange] = definition.content.solution.requiredChanges
  assert.equal(
    evaluateCase(definition, createState(definition, { [firstChange.target]: firstChange.value })).status,
    'incomplete'
  )
})
