import { Hono } from "hono";
import type { RequestContext } from "../types/RequestContext.js";
import { ok } from "../core/result.js";
import { middlewares } from "../middleware/index.js";
import { updatePermission } from "../app/permissions/usecase/update-permission.js";

const permissionsRoutes = new Hono<RequestContext>();

// Require authenticated user with permission to manage permissions
const MANAGE_PERMISSIONS = "manage-permission";

permissionsRoutes.use("*", middlewares.auth);
permissionsRoutes.use("*", middlewares.permissions([MANAGE_PERMISSIONS]));

// Update only name and description; slug and lifecycle are immutable here
permissionsRoutes.put( "/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const permission = await updatePermission({ id, ...body });
  return c.json(ok(permission));
});

export default permissionsRoutes;

