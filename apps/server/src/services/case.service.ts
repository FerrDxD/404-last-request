import { CaseRepository } from '../repositories/case.repository.js'
import { isCaseDefinition, type CaseDefinition, type CaseMetadata } from '@404-last-request/shared'

export class CaseService {
  private caseRepository: CaseRepository

  constructor() {
    this.caseRepository = new CaseRepository()
  }

  async getAllCases(): Promise<CaseMetadata[]> {
    const cases = await this.caseRepository.findAll()
    return cases.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      order: c.order
    }))
  }

  async getCaseBySlug(slug: string): Promise<CaseDefinition | null> {
    const caseData = await this.caseRepository.findBySlug(slug)
    if (!caseData) return null

    const definition: unknown = {
      id: caseData.id,
      slug: caseData.slug,
      title: caseData.title,
      description: caseData.description,
      difficulty: caseData.difficulty,
      order: caseData.order,
      content: caseData.content
    }
    if (!isCaseDefinition(definition)) {
      throw new Error(`Stored case content is invalid for slug "${slug}".`)
    }
    return definition
  }
}
