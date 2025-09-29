import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import { RemoveUserRolesInput } from "../schema.js";
import { findUserById, getRoleIdsForUser, getUserRoles, removeUserRoles as removeRoles } from "../queries.js";

export async function removeUserRoles(input: RemoveUserRolesInput) {
  const { id: userId, roleIds } = parseWith(RemoveUserRolesInput, input);
  const user = await findUserById(userId);
  if (!user) throw new DomainError("User not found", "NOT_FOUND");

  const current = new Set(await getRoleIdsForUser(userId));
  const toRemove = Array.from(new Set(roleIds)).filter((rid) => current.has(rid));
  if (toRemove.length) await removeRoles(userId, toRemove);

  const assigned = await getUserRoles(userId);
  return { userId, roles: assigned };
}

