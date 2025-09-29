import db from "../../db/index.js";
import { and, eq, inArray } from "drizzle-orm";
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
