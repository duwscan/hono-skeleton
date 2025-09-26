import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { routes } from './routes/index.js'
import { openAPIRouteHandler } from 'hono-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { auth } from './config/auth.js'
import type { RequestContext } from './types/RequestContext.js'
import { bootstrapMiddlewares } from './middleware/index.js'

const app = new Hono<RequestContext>()
const openAPIAuthSchema = await auth.api.generateOpenAPISchema()
app.get(
  '/doc',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Hono API',
        version: '1.0.0',
        description: 'Greeting API',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local Server' },
      ],
      // @ts-ignore
      paths: openAPIAuthSchema.paths
    },
  })
)
bootstrapMiddlewares(app)
routes(app)
app.get('/ui', swaggerUI({ url: '/doc' }))
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
