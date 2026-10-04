import type { CaseDefinition, CaseState, EvaluationResult } from '@404-last-request/shared'

export function evaluateCase(caseDefinition: CaseDefinition, caseState: CaseState): EvaluationResult {
  const { solution } = caseDefinition.content
  const { modifiedValues } = caseState

  const requiredChanges = solution.requiredChanges
  const changedTargets = requiredChanges.filter(change => Object.prototype.hasOwnProperty.call(modifiedValues, change.target))
  const incorrectChange = changedTargets.find(change => !Object.is(modifiedValues[change.target], change.value))

  if (incorrectChange) {
    return {
      status: 'failed',
      message: solution.failureMessage || 'The patch did not pass the regression test. Review the relevant evidence and try again.',
      feedback: [
        {
          type: 'error',
          message: 'The staged values do not match the case requirements.'
        }
      ]
    }
  }

  const allChangesMade = requiredChanges.every(change => Object.is(modifiedValues[change.target], change.value))
  if (!allChangesMade) {
    return {
      status: 'incomplete',
      message: solution.incompleteMessage || 'Some required fixes are not staged yet.',
      feedback: [
        {
          type: 'info',
          message: 'Investigate the remaining clues and stage every required fix before testing again.'
        }
      ]
    }
  }

  return {
    status: 'success',
    message: solution.successMessage || 'Case completed successfully.',
    feedback: [
      {
        type: 'info',
        message: 'Great work debugging this issue!'
      }
    ]
  }
}
