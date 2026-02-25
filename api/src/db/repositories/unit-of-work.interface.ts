import type { IProfileRepository } from './profile.repository.interface.js'
import type { IUserRepository } from './user.repository.interface.js'

export interface TransactionalRepositories {
  users: IUserRepository
  profiles: IProfileRepository
}

export interface IUnitOfWork {
  runInTransaction<T>(
    work: (repositories: TransactionalRepositories) => Promise<T>
  ): Promise<T>
}
