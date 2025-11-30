import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'API is running directly from api/index.ts!',
    timestamp: new Date().toISOString()
  })
})

app.get('/test', (c) => {
  return c.json({ message: 'Test route working' })
})

app.all('*', (c) => {
  return c.json(
    {
      status: 'error',
      message: 'Route not found',
      path: c.req.path
    },
    404
  )
})

export const config = {
  runtime: 'nodejs'
}

export default handle(app)
