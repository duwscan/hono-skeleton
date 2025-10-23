import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { routes } from './routes/index.js'
import { openAPIRouteHandler } from 'hono-openapi'
import { auth } from './config/auth.js'
import type { RequestContext } from './types/RequestContext.js'
import { bootstrapMiddlewares } from './middleware/index.js'
import { generateAndSaveApiDocs, registerLLMTextDocs, registerScalarDocs } from './ultis/docs-helper.js'

const app = new Hono<RequestContext>()
const route = new Hono<RequestContext>()
bootstrapMiddlewares(app)
// bootstrap auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
// bootstrap routes
routes(route)
app.route('/api',route)
await generateAndSaveApiDocs(app)
await registerLLMTextDocs(app)
await registerScalarDocs(app)
serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
