import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { isHttpError } from 'http-errors'
import { env } from '../src/env.js'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  })
)

app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', env: env.NODE_ENV })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (isHttpError(err)) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export { app }
export default app
