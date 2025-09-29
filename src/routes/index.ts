import { Hono } from 'hono'
import authRoutes from './dummy.js';
import rolesRoutes from './roles.js';
import permissionsRoutes from './permissions.js';
import usersRoutes from './users.js';
import { auth } from '../config/auth.js';
import type { RequestContext } from '../types/RequestContext.js';

export const routes = (app: Hono<RequestContext>) => {
  app.route('/dummy', authRoutes)
  app.route('/roles', rolesRoutes)
  app.route('/permissions', permissionsRoutes)
  app.route('/users', usersRoutes)
  app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  });

  return app;
}
