import type { Request, Response } from 'express'
import { ok } from '../../middleware/response.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { AuthService } from './auth.service.js'

export function createAuthController(service: AuthService) {
  return {
    register: asyncHandler(async (req: Request, res: Response) => {
      const result = await service.register(req.body)
      ok(res, result, 201)
    }),
    login: asyncHandler(async (req: Request, res: Response) => {
      const result = await service.login(req.body)
      ok(res, result)
    }),
  }
}
