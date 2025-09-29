import db from "../../db/index.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import { permissions, rolePermissions, roles } from "../../db/schema.js";

export async function findRoleBySlug(slug: string) {
  const result = await db.select().from(roles).where(eq(roles.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function findRoleById(id: number) {
  const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return result[0] ?? null;
}

export async function insertRole(input: { name: string; slug: string; description?: string }) {
  await db
    .insert(roles)
    .values({ name: input.name, slug: input.slug, description: input.description });
  // MySQL doesn't support RETURNING; fetch by slug
  const created = await findRoleBySlug(input.slug);
  return created!;
}

export async function updateRoleById(
  id: number,
  input: { name?: string; slug?: string; description?: string }
) {
  await db
    .update(roles)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: sql`(now())`,
    })
    .where(eq(roles.id, id));
  const row = await findRoleById(id);
  return row ?? null;
}

export async function deleteRoleById(id: number) {
  const res: any = await db.delete(roles).where(eq(roles.id, id));
  if (res && typeof res.affectedRows === "number" && res.affectedRows > 0) {
    return { id };
  }
  return null;
}

// role-permissions helpers
export async function getPermissionIdsForRole(roleId: number) {
  const rows = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));
  return rows.map((r) => r.permissionId);
}

export async function findPermissionsByIds(ids: number[]) {
  if (ids.length === 0) return [] as Array<typeof permissions.$inferSelect>;
  return await db.select().from(permissions).where(inArray(permissions.id, ids));
}

export async function addRolePermissions(roleId: number, permissionIds: number[]) {
  if (permissionIds.length === 0) return;
  await db.insert(rolePermissions).values(
    permissionIds.map((pid) => ({ roleId, permissionId: pid }))
  );
}

export async function removeRolePermissions(roleId: number, permissionIds: number[]) {
  if (permissionIds.length === 0) return;
  await db
    .delete(rolePermissions)
    .where(
      and(eq(rolePermissions.roleId, roleId), inArray(rolePermissions.permissionId, permissionIds))
    );
}

export async function getRolePermissions(roleId: number) {
  const rows = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      slug: permissions.slug,
      description: permissions.description,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));
  return rows;
}
