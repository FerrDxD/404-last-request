import type { Request, Response } from 'express'
import { SessionService } from '../services/session.service.js'

const objectIdPattern = /^[a-f\d]{24}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class SessionController {
  private readonly sessionService = new SessionService()

  async createSession(req: Request, res: Response): Promise<void> {
    const body: unknown = req.body
    if (!isRecord(body) || typeof body.caseId !== 'string' || !objectIdPattern.test(body.caseId)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'caseId must be a valid case identifier.'
        }
      })
      return
    }

    try {
      const session = await this.sessionService.createSession(body.caseId)
      if (!session) {
        res.status(404).json({
          error: {
            code: 'CASE_NOT_FOUND',
            message: 'Case not found.'
          }
        })
        return
      }

      res.status(201).json({ data: { sessionId: session.id } })
    } catch (error) {
      console.error('Failed to create game session:', error)
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'A game session could not be started right now.'
        }
      })
    }
  }

  async completeSession(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    if (!objectIdPattern.test(id)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session id has an invalid format.'
        }
      })
      return
    }

    const body: unknown = req.body
    if (!isRecord(body) ||
        !Number.isInteger(body.score) || Number(body.score) < 0 || Number(body.score) > 1000 ||
        !Number.isInteger(body.attempts) || Number(body.attempts) < 1 || Number(body.attempts) > 10000 ||
        !Number.isInteger(body.hintsUsed) || Number(body.hintsUsed) < 0 || Number(body.hintsUsed) > 3) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'score (0–1000), attempts (1–10000), and hintsUsed (0–3) must be valid integers.'
        }
      })
      return
    }

    try {
      const session = await this.sessionService.completeSession(
        id,
        Number(body.score),
        Number(body.attempts),
        Number(body.hintsUsed)
      )
      if (!session) {
        res.status(404).json({
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found.'
          }
        })
        return
      }

      res.json({
        data: {
          sessionId: session.id,
          score: session.score
        }
      })
    } catch (error) {
      console.error('Failed to complete game session:', error)
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'The completed game session could not be recorded.'
        }
      })
    }
  }
}
