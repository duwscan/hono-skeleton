import db from "../../db/index.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  permissions,
  rolePermissions,
  roles,
  roleUsers,
  users,
} from "../../db/schema.js";

export async function hasRoles(userId: string, slugs: string[]) {
  const result = await db
    .select({ id: roles.id, name: roles.name, slug: roles.slug })
    .from(roleUsers)
    .innerJoin(roles, eq(roleUsers.roleId, roles.id))
    .where(and(eq(roleUsers.userId, userId), inArray(roles.slug, slugs)))
    .limit(1);

  return result.length > 0;
}

export async function hasPermissions(userId: string, permissionSlugs: string[]) {
  const result = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      slug: permissions.slug,
    })
    .from(roleUsers)
    .innerJoin(roles, eq(roleUsers.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(eq(roleUsers.userId, userId), inArray(permissions.slug, permissionSlugs))
    )
    .limit(1);

  return result.length > 0;
}

export async function getUserRoles(userId: string) {
  const result = await db
    .select({ id: roles.id, name: roles.name, slug: roles.slug })
    .from(roleUsers)
    .innerJoin(roles, eq(roleUsers.roleId, roles.id))
    .where(eq(roleUsers.userId, userId));

  return result;
}

export async function getUserPermissions(userId: string) {
  const result = await db
    .selectDistinct({
      id: permissions.id,
      name: permissions.name,
      slug: permissions.slug,
    })
    .from(roleUsers)
    .innerJoin(roles, eq(roleUsers.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(roleUsers.userId, userId));

  // distinct by slug

  return result;
}

export async function getUserRolePermissions(userId: string, roleSlug: string) {
  const result = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      slug: permissions.slug,
    })
    .from(roleUsers)
    .innerJoin(roles, eq(roleUsers.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(roleUsers.userId, userId), eq(roles.slug, roleSlug)));

  return result;
}

// Management helpers
export async function findUserById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listUsers() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      emailVerified: users.emailVerified,
    })
    .from(users);
}

export async function updateUserById(
  id: string,
  input: { name?: string; image?: string | null }
) {
  await db
    .update(users)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      updatedAt: sql`(now())`,
    })
    .where(eq(users.id, id));
  return await findUserById(id);
}

export async function findRolesByIds(ids: number[]) {
  if (ids.length === 0) return [] as Array<typeof roles.$inferSelect>;
  return await db.select().from(roles).where(inArray(roles.id, ids));
}

export async function getRoleIdsForUser(userId: string) {
  const rows = await db
    .select({ roleId: roleUsers.roleId })
    .from(roleUsers)
    .where(eq(roleUsers.userId, userId));
  return rows.map((r) => r.roleId);
}

export async function addUserRoles(userId: string, roleIds: number[]) {
  if (roleIds.length === 0) return;
  await db.insert(roleUsers).values(roleIds.map((rid) => ({ userId, roleId: rid })));
}

export async function removeUserRoles(userId: string, roleIds: number[]) {
  if (roleIds.length === 0) return;
  await db
    .delete(roleUsers)
    .where(and(eq(roleUsers.userId, userId), inArray(roleUsers.roleId, roleIds)));
}
