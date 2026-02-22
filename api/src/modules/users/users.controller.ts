import type { Response } from 'express'
import { ok } from '../../middleware/response.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import type { authenticatedRequest } from '../../middleware/auth.js'
import type { UserService } from './users.service.js'

export function createUserController(service: UserService) {
  return {
    getMe: asyncHandler(async (req: authenticatedRequest, res: Response) => {
      const result = await service.getMe(req.user!.id)
      ok(res, result)
    }),
    updateMe: asyncHandler(async (req: authenticatedRequest, res: Response) => {
      const result = await service.updateMe(req.user!.id, req.body)
      ok(res, result)
    }),
  }
}
