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

export interface AuthUserPayload {
  id: string
  email: string
  name: string
  lastName: string
  role: string
}

export interface AuthResponse {
  user: AuthUserPayload
  token: string
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    await this.assertEmailAvailable(input.email)
    const user = await this.createUserWithProfile(input)
    return this.buildAuthResponse(user)
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.resolveAuthenticatedUser(input.email, input.password)
    return this.buildAuthResponse(user)
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(email)
    if (existing) throw createError(400, 'Email already registered')
  }

  private async createUserWithProfile(input: RegisterInput) {
    const { password, bio, ...userFields } = input
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)
    const user = await this.userRepo.create({ ...userFields, passwordHash })
    await this.profileRepo.create({ userId: user.id, bio })
    return user
  }

  private async resolveAuthenticatedUser(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) throw createError(401, 'Invalid email or password')
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw createError(401, 'Invalid email or password')
    return user
  }

  private async buildAuthResponse(user: AuthUserPayload): Promise<AuthResponse> {
    const token = await generateJWT({ id: user.id, email: user.email, name: user.name, lastName: user.lastName })
    return { user: { id: user.id, email: user.email, name: user.name, lastName: user.lastName, role: user.role }, token }
  }
}
