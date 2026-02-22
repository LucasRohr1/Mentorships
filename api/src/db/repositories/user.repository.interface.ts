import type { User } from '../schema.js'

export interface CreateUserInput {
  email: string
  name: string
  lastName: string
  passwordHash: string
  role: 'mentor' | 'student' | 'admin'
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  create(data: CreateUserInput): Promise<User>
}
