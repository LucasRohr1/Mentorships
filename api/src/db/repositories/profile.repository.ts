import { eq } from 'drizzle-orm'
import type { IProfileRepository, CreateProfileInput } from './profile.repository.interface.js'
import { db } from '../connection.js'
import { profiles } from '../schema.js'

export class DrizzleProfileRepository implements IProfileRepository {
  constructor(private readonly _db: typeof db = db) {}

  async create(data: CreateProfileInput) {
    const [profile] = await this._db.insert(profiles).values(data).returning()
    if (!profile) throw new Error('Failed to create profile')
    return profile
  }

  async findByUserId(userId: string) {
    const [profile] = await this._db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
    return profile ?? null
  }
}
