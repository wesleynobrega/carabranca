// api/index.ts – função mínima de teste na Vercel

import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono()

app.get('/', (c) =>
  c.json({
    status: 'ok',
    message: 'Minimal Hono API on Vercel',
    timestamp: new Date().toISOString(),
  }),
)

app.get('/test', (c) => c.json({ message: 'Test route working' }))

export const config = {
  runtime: 'nodejs',
}

export default handle(app)
