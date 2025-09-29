import db from "../../db/index.js";
import { eq, sql } from "drizzle-orm";
import { permissions } from "../../db/schema.js";

export async function findPermissionById(id: number) {
  const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updatePermissionById(
  id: number,
  input: { name?: string; description?: string }
) {
  await db
    .update(permissions)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: sql`(now())`,
    })
    .where(eq(permissions.id, id));
  const row = await findPermissionById(id);
  return row ?? null;
}

