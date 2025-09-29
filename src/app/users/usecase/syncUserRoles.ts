import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import { SyncUserRolesInput } from "../schema.js";
import {
  addUserRoles,
  findRolesByIds,
  findUserById,
  getRoleIdsForUser,
  getUserRoles,
  removeUserRoles,
} from "../queries.js";

export async function syncUserRoles(input: SyncUserRolesInput) {
  const { id: userId, roleIds } = parseWith(SyncUserRolesInput, input);
  const user = await findUserById(userId);
  if (!user) throw new DomainError("User not found", "NOT_FOUND");

  const uniqueIds = Array.from(new Set(roleIds));
  const roles = await findRolesByIds(uniqueIds);
  if (roles.length !== uniqueIds.length) {
    throw new DomainError("Some roles not found", "NOT_FOUND");
  }

  const current = new Set(await getRoleIdsForUser(userId));
  const desired = new Set(uniqueIds);

  const toAdd: number[] = [];
  const toRemove: number[] = [];

  for (const rid of desired) if (!current.has(rid)) toAdd.push(rid);
  for (const rid of current) if (!desired.has(rid)) toRemove.push(rid);

  if (toAdd.length) await addUserRoles(userId, toAdd);
  if (toRemove.length) await removeUserRoles(userId, toRemove);

  const assigned = await getUserRoles(userId);
  return { userId, roles: assigned };
}

