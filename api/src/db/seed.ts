import 'dotenv/config'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from './connection.js'
import { users, profiles, categories } from './schema.js'
import { env } from '../env.js'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'admin123'
const DEFAULT_CATEGORIES = [
  'software',
  'ejercicio',
  'matematicas',
  'quimica',
  'biologia',
  'fisica',
  'carpinteria',
]

async function seed() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS)

  await db.insert(users).values({
    email: ADMIN_EMAIL,
    name: 'lucas',
    lastName: 'rohr',
    passwordHash,
    role: 'admin',
  }).onConflictDoNothing({ target: users.email })

  const [admin] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL))
  if (admin) {
    await db.insert(profiles).values({
      userId: admin.id,
      bio: 'admin user',
    }).onConflictDoNothing({ target: profiles.userId })
  }

  for (const name of DEFAULT_CATEGORIES) {
    await db.insert(categories).values({ name }).onConflictDoNothing({ target: categories.name })
  }

  console.log('Seed completed successfully')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})