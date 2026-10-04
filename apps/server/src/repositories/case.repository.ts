import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class CaseRepository {
  async findAll() {
    return await prisma.case.findMany({
      orderBy: { order: 'asc' }
    })
  }

  async findBySlug(slug: string) {
    return await prisma.case.findUnique({
      where: { slug }
    })
  }

  async findById(id: string) {
    return await prisma.case.findUnique({
      where: { id }
    })
  }

}
