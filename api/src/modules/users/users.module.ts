import { DrizzleUserRepository } from '../../db/repositories/user.repository.js'
import { DrizzleProfileRepository } from '../../db/repositories/profile.repository.js'
import { DrizzleUnitOfWork } from '../../db/repositories/unit-of-work.js'
import { UserService } from './users.service.js'
import { createUserController } from './users.controller.js'
import { createUserRoutes } from './users.routes.js'

const userRepo = new DrizzleUserRepository()
const profileRepo = new DrizzleProfileRepository()
const unitOfWork = new DrizzleUnitOfWork()
const userService = new UserService(userRepo, profileRepo, unitOfWork)
const controller = createUserController(userService)

const userRouter = createUserRoutes(controller)
export { userRouter }