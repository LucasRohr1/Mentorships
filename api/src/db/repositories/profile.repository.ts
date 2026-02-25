import { eq } from 'drizzle-orm'
import createError from 'http-errors'
import type { IProfileRepository, CreateProfileInput, UpdateProfileInput } from './profile.repository.interface.js'
import { db } from '../connection.js'
import { profiles } from '../schema.js'

type DatabaseClient = typeof db
type TransactionClient = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0]
type RepositoryClient = DatabaseClient | TransactionClient

export class DrizzleProfileRepository implements IProfileRepository {
  constructor(private readonly _db: RepositoryClient = db) {}

  async create(data: CreateProfileInput) {
    const [profile] = await this._db.insert(profiles).values(data).returning()
    if (!profile) throw createError(500, 'Failed to create profile')
    return profile
  }

  async findByUserId(userId: string) {
    const [profile] = await this._db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
    return profile ?? null
  }

  async update(userId: string, data: UpdateProfileInput) {
    const [profile] = await this._db
      .update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning()
    if (!profile) throw createError(404, 'Profile not found')
    return profile
  }
}
