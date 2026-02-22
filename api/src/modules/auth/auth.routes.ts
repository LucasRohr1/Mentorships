import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate.js'
import type { createAuthController } from './auth.controller.js'

const registerSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().min(8).nonempty(),
  name: z.string().min(1).nonempty(),
  lastName: z.string().min(1).nonempty(),
  role: z.enum(['mentor', 'student', 'admin']),
  bio: z.string().min(1).nonempty(),
})

const loginSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().min(1).nonempty(),
})

export type AuthController = ReturnType<typeof createAuthController>

export function createAuthRoutes(controller: AuthController) {
  const router = Router()
  router.post('/register', validate(registerSchema), controller.register)
  router.post('/login', validate(loginSchema), controller.login)
  return router
}
