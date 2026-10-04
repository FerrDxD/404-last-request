import type { ScoreInput, ScoreResult } from '@404-last-request/shared'

export function calculateScore(input: ScoreInput): ScoreResult {
  const { elapsedMs, attempts, hintsUsed } = input

  // Base score
  const baseScore = 1000

  // Time penalty: 1 point per second over 5 minutes
  const timePenalty = Math.max(0, Math.floor((elapsedMs - 300000) / 1000))

  // Attempt penalty: 50 points per attempt after the first
  const attemptPenalty = Math.max(0, (attempts - 1) * 50)

  // Hint penalty: 100 points per hint
  const hintPenalty = hintsUsed * 100

  // Calculate final score
  const finalScore = Math.max(0, baseScore - timePenalty - attemptPenalty - hintPenalty)

  // Calculate rating
  let rating = '★☆☆☆☆'
  if (finalScore >= 900) rating = '★★★★★'
  else if (finalScore >= 750) rating = '★★★★☆'
  else if (finalScore >= 600) rating = '★★★☆☆'
  else if (finalScore >= 450) rating = '★★☆☆☆'

  return {
    score: finalScore,
    rating,
    breakdown: {
      base: baseScore,
      timePenalty,
      attemptPenalty,
      hintPenalty
    }
  }
}
