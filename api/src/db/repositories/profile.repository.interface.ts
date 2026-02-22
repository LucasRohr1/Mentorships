import type { Profile } from '../schema.js'

export interface CreateProfileInput {
  userId: string
  bio: string
  linkedinUrl?: string
  avatarUrl?: string
}

export interface UpdateProfileInput {
  bio?: string
  linkedinUrl?: string | null
  avatarUrl?: string | null
}

export interface IProfileRepository {
  create(data: CreateProfileInput): Promise<Profile>
  findByUserId(userId: string): Promise<Profile | null>
  update(userId: string, data: UpdateProfileInput): Promise<Profile>
}
