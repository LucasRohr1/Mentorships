import 'dotenv/config'
import { z } from 'zod'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'
const isTesting = process.env.NODE_ENV === 'test'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().positive().default(3000),

  DATABASE_URL: z.string().startsWith('postgresql://'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  //JWT_EXPIRES_IN: z.string().default('7d'),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),

  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(20).default(12),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

export type Env = z.infer<typeof envSchema>

let env: Env

try {
  env = envSchema.parse(process.env)
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error('Invalid environment variables:')
    e.issues.forEach((issue) => {
      const path = issue.path.join('.')
      console.error(`  ${path}: ${issue.message}`)
    })
    process.exit(1)
  }
  throw e
}

export const isProd = () => env.NODE_ENV === 'production'
export const isDev = () => env.NODE_ENV === 'development'
export const isTest = () => env.NODE_ENV === 'test'

export { env }
export default env
