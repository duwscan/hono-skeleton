import { Hono } from "hono";
import { describeRoute } from 'hono-openapi'
import type { RequestContext } from '../types/RequestContext.js';
import { ok } from "../core/result.js";
import { middlewares } from "../middleware/index.js";

const dummyRoutes = new Hono<RequestContext>()
dummyRoutes.use('*', middlewares.auth)
dummyRoutes.post('/hello', describeRoute({
  description: 'Say hello to the user',
  responses: {
    200: {
      description: 'Successful response',
    },
  },
}), async (c) => {
  return c.json(ok(c.get('user')))
})



export default dummyRoutes