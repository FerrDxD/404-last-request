import express from 'express'
import { CaseController } from '../controllers/case.controller.js'

const router = express.Router()
const caseController = new CaseController()

router.get('/', caseController.getAllCases.bind(caseController))
router.get('/:slug', caseController.getCaseBySlug.bind(caseController))

export default router
