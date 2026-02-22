import type { Profile } from '../schema.js'

export interface CreateProfileInput {
  userId: string
  bio: string
  linkedinUrl?: string
  avatarUrl?: string
}

export interface IProfileRepository {
  create(data: CreateProfileInput): Promise<Profile>
  findByUserId(userId: string): Promise<Profile | null>
}
