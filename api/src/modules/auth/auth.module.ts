import { DrizzleUserRepository } from '../../db/repositories/user.repository.js'
import { DrizzleProfileRepository } from '../../db/repositories/profile.repository.js'
import { DrizzleUnitOfWork } from '../../db/repositories/unit-of-work.js'
import { AuthService } from './auth.service.js'
import { createAuthController } from './auth.controller.js'
import { createAuthRoutes } from './auth.routes.js'

const userRepo = new DrizzleUserRepository()
const profileRepo = new DrizzleProfileRepository()
const unitOfWork = new DrizzleUnitOfWork()
const authService = new AuthService(userRepo, profileRepo, unitOfWork)
const controller = createAuthController(authService)

export const authRouter = createAuthRoutes(controller)
