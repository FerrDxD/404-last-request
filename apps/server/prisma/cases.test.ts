import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isCaseDefinition } from '@404-last-request/shared'
import { caseDefinitions } from './cases'

test('provides six valid and sequential case definitions', () => {
  assert.equal(caseDefinitions.length, 6)
  assert.deepEqual(caseDefinitions.map(item => item.order), [1, 2, 3, 4, 5, 6])

  const slugs = new Set<string>()
  for (const definition of caseDefinitions) {
    assert.ok(isCaseDefinition(definition), definition.slug)
    assert.equal(slugs.has(definition.slug), false, `duplicate slug: ${definition.slug}`)
    slugs.add(definition.slug)
  }
})

test('ensures every required patch is an allowed modification', () => {
  for (const definition of caseDefinitions) {
    assert.ok(definition.content.hints.length === 3, definition.slug)
    for (const change of definition.content.solution.requiredChanges) {
      const action = definition.content.actions.find(item =>
        item.type === 'modify' && item.target === change.target
      )
      assert.ok(action?.allowedValues?.some(value => Object.is(value, change.value)), definition.slug)
    }
  }
})
