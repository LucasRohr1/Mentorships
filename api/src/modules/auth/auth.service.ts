import bcrypt from 'bcrypt'
import createError from 'http-errors'
import type { IUserRepository } from '../../db/repositories/user.repository.interface.js'
import type { IProfileRepository } from '../../db/repositories/profile.repository.interface.js'
import type { CreateUserInput } from '../../db/repositories/user.repository.interface.js'
import { generateJWT } from '../../../utils/jwt.js'
import { env } from '../../env.js'

export interface RegisterInput extends Omit<CreateUserInput, 'passwordHash'> {
  password: string
  bio: string
}

export interface LoginInput {
  email: string
  password: string
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) throw createError(400, 'Email already registered')

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)
    const user = await this.userRepo.create({
      ...input,
      passwordHash,
    })
    await this.profileRepo.create({ userId: user.id, bio: input.bio })
    const token = await generateJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    })
    return { user: { id: user.id, email: user.email, name: user.name, lastName: user.lastName, role: user.role }, token }
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) throw createError(401, 'Invalid email or password')

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw createError(401, 'Invalid email or password')

    const token = await generateJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    })
    return { user: { id: user.id, email: user.email, name: user.name, lastName: user.lastName, role: user.role }, token }
  }
}
