import { Hono } from "hono";
import type { RequestContext } from "../types/RequestContext.js";
import { ok } from "../core/result.js";
import { middlewares } from "../middleware/index.js";
import { updateUser } from "../app/users/usecase/updateUser.js";
import { addUserRoles } from "../app/users/usecase/addUserRoles.js";
import { removeUserRoles } from "../app/users/usecase/removeUserRoles.js";
import { syncUserRoles } from "../app/users/usecase/syncUserRoles.js";
import { findUserById, getUserPermissions, getUserRoles, listUsers } from "../app/users/queries.js";

const usersRoutes = new Hono<RequestContext>();

const MANAGE_USERS_PERMISSION = "manage-users";

usersRoutes.use("*", middlewares.auth);
usersRoutes.use("*", middlewares.permissions([MANAGE_USERS_PERMISSION]));

// List users
usersRoutes.get("/", async (c) => {
  const rows = await listUsers();
  return c.json(ok(rows));
});

// Get user with roles and permissions
usersRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await findUserById(id);
  if (!user) return c.json(ok(null), 200);
  const [roles, permissions] = await Promise.all([
    getUserRoles(id),
    getUserPermissions(id),
  ]);
  return c.json(ok({ user, roles, permissions }));
});

// Update user profile (name/image)
usersRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await updateUser({ id, ...body });
  return c.json(ok(result));
});

// Roles management for user
usersRoutes.put("/:id/roles", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await syncUserRoles({ id, roleIds: body?.roleIds ?? [] });
  return c.json(ok(result));
});

usersRoutes.post("/:id/roles", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await addUserRoles({ id, roleIds: body?.roleIds ?? [] });
  return c.json(ok(result), 201);
});

usersRoutes.delete("/:id/roles", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await removeUserRoles({ id, roleIds: body?.roleIds ?? [] });
  return c.json(ok(result));
});

export default usersRoutes;

