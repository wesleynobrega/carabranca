// api/index.ts

import app from '../backend/honop'

// Exporta o handler serverless para a Vercel
export default app.fetch
