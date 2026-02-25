import bcrypt from 'bcrypt'
import createError from 'http-errors'
import type { IProfileRepository } from '../../db/repositories/profile.repository.interface.js'
import type { IUnitOfWork } from '../../db/repositories/unit-of-work.interface.js'
import type { IUserRepository } from '../../db/repositories/user.repository.interface.js'
import type { Profile, User } from '../../db/schema.js'
import { env } from '../../env.js'


export interface UpdateMeInput {
  name?: string
  lastName?: string
  email?: string
  password?: string
  currentPassword?: string
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
    private readonly profileRepo: IProfileRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async getMe(userId: string): Promise<UserWithProfile> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw createError(404, 'User not found')
    const profile = await this.profileRepo.findByUserId(userId)
    return this.toUserWithProfile(user, profile)
  }

  async updateMe(userId: string, input: UpdateMeInput): Promise<UserWithProfile> {
    if (input.password) await this.assertCurrentPasswordValid(userId, input.currentPassword!)
    if (input.email !== undefined) await this.assertEmailAvailableForUpdate(input.email, userId)
    
    const userData = await this.extractUserData(input)
    const profileData = this.extractProfileData(input)

    await this.unitOfWork.runInTransaction(async ({ users, profiles }) => {
      if (Object.keys(userData).length > 0) await users.update(userId, userData)
      if (Object.keys(profileData).length > 0) await profiles.update(userId, profileData)
    })

    return this.getMe(userId)
  }

  private async assertCurrentPasswordValid(userId: string, currentPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw createError(404, 'User not found')
    const matches = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!matches) throw createError(400, 'Current password is incorrect')
  }

  private async assertEmailAvailableForUpdate(email: string, userId: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(email)
    if (existing && existing.id !== userId) throw createError(400, 'Email already registered')
  }

  private async extractUserData(input: UpdateMeInput): Promise<{ name?: string; lastName?: string; email?: string; passwordHash?: string }> {
    const data: { name?: string; lastName?: string; email?: string; passwordHash?: string } = {}
    if (input.name !== undefined) data.name = input.name
    if (input.lastName !== undefined) data.lastName = input.lastName
    if (input.email !== undefined) data.email = input.email
    if (input.password) data.passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)
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
