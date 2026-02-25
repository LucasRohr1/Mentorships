import { eq } from 'drizzle-orm'
import createError from 'http-errors'
import type { IUserRepository, CreateUserInput, UpdateUserInput } from './user.repository.interface.js'
import { db } from '../connection.js'
import { users } from '../schema.js'

type DatabaseClient = typeof db
type TransactionClient = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0]
type RepositoryClient = DatabaseClient | TransactionClient

export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly _db: RepositoryClient = db) {}

  async findByEmail(email: string) {
    const [user] = await this._db.select().from(users).where(eq(users.email, email))
    return user ?? null
  }

  async findById(id: string) {
    const [user] = await this._db.select().from(users).where(eq(users.id, id))
    return user ?? null
  }

  async create(data: CreateUserInput) {
    const [user] = await this._db.insert(users).values(data).returning()
    if (!user) throw createError(500, 'Failed to create user')
    return user
  }

  async update(id: string, data: UpdateUserInput) {
    const [user] = await this._db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    if (!user) throw createError(404, 'User not found')
    return user
  }
}
