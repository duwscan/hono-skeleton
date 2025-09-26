import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoutes from './dummy.js';
import { auth } from '../config/auth.js';
import type { RequestContext } from '../types/RequestContext.js';

export const routes = (app: Hono<RequestContext>) => {
  app.route('/api', authRoutes)
  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });
}