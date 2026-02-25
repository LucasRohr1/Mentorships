import { db } from '../connection.js'
import { DrizzleProfileRepository } from './profile.repository.js'
import { DrizzleUserRepository } from './user.repository.js'
import type {
  IUnitOfWork,
  TransactionalRepositories,
} from './unit-of-work.interface.js'

export class DrizzleUnitOfWork implements IUnitOfWork {
  constructor(private readonly _db: typeof db = db) {}

  async runInTransaction<T>(
    work: (repositories: TransactionalRepositories) => Promise<T>
  ): Promise<T> {
    return this._db.transaction(async (tx) => {
      const repositories: TransactionalRepositories = {
        users: new DrizzleUserRepository(tx),
        profiles: new DrizzleProfileRepository(tx),
      }

      return work(repositories)
    })
  }
}
