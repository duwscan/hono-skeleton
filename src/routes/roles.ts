import { Hono } from "hono";
import type { RequestContext } from "../types/RequestContext.js";
import { ok} from "../core/result.js";
import { middlewares } from "../middleware/index.js";
import { createRole } from "../app/roles/usecase/createRole.js";
import { updateRole } from "../app/roles/usecase/updateRole.js";
import { updateRoleName } from "../app/roles/usecase/updateRoleName.js";
import { deleteRole } from "../app/roles/usecase/deleteRole.js";
import { syncRolePermissions } from "../app/roles/usecase/syncRolePermissions.js";
import { addRolePermissions } from "../app/roles/usecase/addRolePermissions.js";
import { removeRolePermissions } from "../app/roles/usecase/removeRolePermissions.js";

const rolesRoutes = new Hono<RequestContext>();

// Require authenticated user with permission to manage role permission
const MANAGE_ROLES_PERMISSION = "manage-role-permission";

rolesRoutes.use("*", middlewares.auth);
rolesRoutes.use("*", middlewares.permissions([MANAGE_ROLES_PERMISSION]));

rolesRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const role = await createRole(body);
  return c.json(ok(role), 201);
});

rolesRoutes.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const role = await updateRole({ id, ...body });
    return c.json(ok(role));
});

rolesRoutes.patch("/:id/name", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const role = await updateRoleName({ id, name: body?.name });
  return c.json(ok(role));
});

rolesRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const res = await deleteRole(id);
  return c.json(ok(res));
});

// Sync permissions for a role (assign/remove)
rolesRoutes.put("/:id/permissions", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = await syncRolePermissions({ id, permissionIds: body?.permissionIds ?? [] });
  return c.json(ok(result));
});

// Add permissions to a role
rolesRoutes.post("/:id/permissions", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = await addRolePermissions({ id, permissionIds: body?.permissionIds ?? [] });
  return c.json(ok(result), 201);
});

// Remove permissions from a role
rolesRoutes.delete("/:id/permissions", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const result = await removeRolePermissions({ id, permissionIds: body?.permissionIds ?? [] });
  return c.json(ok(result));
});

export default rolesRoutes;
