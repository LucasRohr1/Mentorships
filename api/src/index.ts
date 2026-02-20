import { app } from './server.js'
import { env } from '../src/env.js'

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`)
})
