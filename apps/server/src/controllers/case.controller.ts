import { Request, Response } from 'express'
import { CaseService } from '../services/case.service.js'

export class CaseController {
  private caseService: CaseService

  constructor() {
    this.caseService = new CaseService()
  }

  async getAllCases(req: Request, res: Response) {
    try {
      const cases = await this.caseService.getAllCases()
      res.json({ data: cases })
    } catch (error) {
      console.error('Failed to retrieve cases:', error)
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'The case archive is temporarily unavailable.'
        }
      })
    }
  }

  async getCaseBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Case slug has an invalid format.'
          }
        })
        return
      }
      const caseData = await this.caseService.getCaseBySlug(slug)

      if (!caseData) {
        res.status(404).json({
          error: {
            code: 'CASE_NOT_FOUND',
            message: 'Case not found.'
          }
        })
        return
      }

      res.json({ data: caseData })
    } catch (error) {
      console.error('Failed to retrieve case:', error)
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'The case could not be loaded right now.'
        }
      })
    }
  }
}
