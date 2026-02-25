import { eq } from 'drizzle-orm'
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

  async update(userId: string, data: UpdateProfileInput) {
    const [profile] = await this._db
      .update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning()
    if (!profile) throw new Error('Profile not found')
    return profile
  }
}
