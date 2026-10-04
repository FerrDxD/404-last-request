import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class SessionRepository {
  async create(caseId: string) {
    return await prisma.session.create({
      data: {
        case: { connect: { id: caseId } }
      }
    })
  }

  async complete(id: string, score: number, attempts: number, hintsUsed: number) {
    return await prisma.session.update({
      where: { id },
      data: {
        completedAt: new Date(),
        score,
        attempts,
        hintsUsed
      }
    })
  }

  async findById(id: string) {
    return await prisma.session.findUnique({
      where: { id },
      include: { case: true }
    })
  }
}
