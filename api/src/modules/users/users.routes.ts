import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import type { createUserController } from './users.controller.js'
import { authenticateToken } from '../../middleware/auth.js'

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  currentPassword: z.string().min(8).optional(),
  bio: z.string().min(1).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
}).refine(
  (data) => !data.password || !!data.currentPassword,
  { message: 'currentPassword is required when changing password', path: ['currentPassword'] }
)

export type UserController = ReturnType<typeof createUserController>

export function createUserRoutes(controller: UserController) {
  const router = Router()
  router.get('/me', authenticateToken, controller.getMe)
  router.patch('/me', authenticateToken, validate(updateMeSchema), controller.updateMe)
  return router
}
