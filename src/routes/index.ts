import { Hono } from 'hono'
import authRoutes from './dummy.js';
import { auth } from '../config/auth.js';
import type { RequestContext } from '../types/RequestContext.js';

export const routes = (app: Hono<RequestContext>) => {
  app.route('/dummy', authRoutes)
  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

  return app;
}
