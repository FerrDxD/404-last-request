import { PrismaClient } from '@prisma/client'
import { caseDefinitions } from './cases.js'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log(`Seeding ${caseDefinitions.length} debugging cases...`)

  for (const definition of caseDefinitions) {
    const { id: _id, content, ...metadata } = definition
    const caseRecord = await prisma.case.upsert({
      where: { slug: definition.slug },
      update: {
        ...metadata,
        content
      },
      create: {
        ...metadata,
        content
      }
    })

    console.log(`Case ${definition.order.toString().padStart(2, '0')} ready: ${caseRecord.slug}`)
  }

  console.log('Case seeding complete.')
}

main()
  .catch(error => {
    console.error('Failed to seed cases:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
