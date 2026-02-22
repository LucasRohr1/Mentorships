import bcrypt from 'bcrypt'
import createError from 'http-errors'
import type { IProfileRepository } from '../../db/repositories/profile.repository.interface.js'
import type { IUserRepository } from '../../db/repositories/user.repository.interface.js'
import type { Profile, User } from '../../db/schema.js'
import { env } from '../../env.js'


export interface UpdateMeInput {
  name?: string
  lastName?: string
  email?: string
  password?: string
  bio?: string
  linkedinUrl?: string | null
  avatarUrl?: string | null
}

export interface UserWithProfile extends Omit<User, 'passwordHash'> {
  profile: Profile | null
}

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository
  ) {}

  async getMe(userId: string): Promise<UserWithProfile> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw createError(404, 'User not found')
    const profile = await this.profileRepo.findByUserId(userId)
    return this.toUserWithProfile(user, profile)
  }

  async updateMe(userId: string, input: UpdateMeInput): Promise<UserWithProfile> {
    const userData = this.extractUserData(input)
    const profileData = this.extractProfileData(input)

    if (Object.keys(userData).length > 0) await this.userRepo.update(userId, userData)
    if (Object.keys(profileData).length > 0) await this.profileRepo.update(userId, profileData)

    return this.getMe(userId)
  }

  private extractUserData(input: UpdateMeInput): { name?: string; lastName?: string; email?: string; passwordHash?: string } {
    const data: { name?: string; lastName?: string; email?: string; passwordHash?: string } = {}
    if (input.name !== undefined) data.name = input.name
    if (input.lastName !== undefined) data.lastName = input.lastName
    if (input.email !== undefined) data.email = input.email
    if (input.password) data.passwordHash = bcrypt.hashSync(input.password, env.BCRYPT_SALT_ROUNDS)
    return data
  }

  private extractProfileData(input: UpdateMeInput): { bio?: string; linkedinUrl?: string | null; avatarUrl?: string | null } {
    const data: { bio?: string; linkedinUrl?: string | null; avatarUrl?: string | null } = {}
    if (input.bio !== undefined) data.bio = input.bio
    if (input.linkedinUrl !== undefined) data.linkedinUrl = input.linkedinUrl
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl
    return data
  }

  private toUserWithProfile(user: User, profile: Profile | null): UserWithProfile {
    const { passwordHash: _, ...safeUser } = user
    return { ...safeUser, profile }
  }
}
