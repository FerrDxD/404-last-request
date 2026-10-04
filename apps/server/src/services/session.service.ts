import { SessionRepository } from '../repositories/session.repository.js'
import { Prisma } from '@prisma/client'

export class SessionService {
  private sessionRepository: SessionRepository

  constructor() {
    this.sessionRepository = new SessionRepository()
  }

  async createSession(caseId: string) {
    try {
      return await this.sessionRepository.create(caseId)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null
      }
      throw error
    }
  }

  async completeSession(id: string, score: number, attempts: number, hintsUsed: number) {
    try {
      return await this.sessionRepository.complete(id, score, attempts, hintsUsed)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null
      }
      throw error
    }
  }
}
