import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

type Source = 'body' | 'params' | 'query'

export function validate(schema: z.ZodType, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source]
    const result = schema.safeParse(data) // devuelve { success: true, data } o { success: false, error }
    if (result.success) {
      req[source] = result.data // result.data es el dato validado
      next()
      return
    }
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }))
    res.status(400).json({ success: false, error: `Invalid ${source}`, details })
  }
}
