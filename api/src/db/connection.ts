import { drizzle } from 'drizzle-orm/node-postgres'
import { env, isProd } from '../env.js'
import * as schema from './schema.js'
import * as relations from './relations.js'
import { Pool } from 'pg'
import {remember} from '@epic-web/remember'

const createPool = () => {
    return new Pool({
        connectionString: env.DATABASE_URL,
    })
}

let client

if (isProd()) {
    client = createPool()
} else {
    client = remember('dbPool', () => createPool())
}

export const db = drizzle({ client, schema: { ...schema, ...relations } })

export default db