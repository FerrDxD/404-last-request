import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import type { ErrorRequestHandler } from 'express'
import caseRoutes from './routes/cases.routes.js'
import sessionRoutes from './routes/sessions.routes.js'
import healthRoutes from './routes/health.routes.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT || 3000)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}))
app.use(express.json({ limit: '100kb' }))

// Routes
app.use('/api/cases', caseRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/health', healthRoutes)

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Unhandled API error:', error)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred'
    }
  })
}

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found.'
    }
  })
})
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Client URL: ${CLIENT_URL}`)
})
