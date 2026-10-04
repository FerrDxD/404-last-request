import express from 'express'
import { SessionController } from '../controllers/session.controller.js'

const router = express.Router()
const sessionController = new SessionController()

router.post('/', sessionController.createSession.bind(sessionController))
router.post('/:id/complete', sessionController.completeSession.bind(sessionController))

export default router
