import { app } from './server.js'
import { env } from './env.js'

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use. Run: npm run port:free`)
  } else {
    console.error('Server error:', err)
  }
  process.exit(1)
})
