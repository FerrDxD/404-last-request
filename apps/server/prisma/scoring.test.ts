import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calculateScore } from '../../web/src/game/scoring/calculator'

test('awards the base score for a fast first-pass run without hints', () => {
  assert.equal(calculateScore({ elapsedMs: 60_000, attempts: 1, hintsUsed: 0 }).score, 1000)
})

test('applies elapsed-time, attempt, and hint penalties', () => {
  const result = calculateScore({ elapsedMs: 360_000, attempts: 3, hintsUsed: 2 })
  assert.equal(result.score, 640)
  assert.deepEqual(result.breakdown, {
    base: 1000,
    timePenalty: 60,
    attemptPenalty: 100,
    hintPenalty: 200
  })
})

test('never awards a negative score', () => {
  assert.equal(calculateScore({ elapsedMs: 2_000_000, attempts: 20, hintsUsed: 3 }).score, 0)
})
