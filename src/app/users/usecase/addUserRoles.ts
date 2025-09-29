import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import { AddUserRolesInput } from "../schema.js";
import { addUserRoles as addRoles, findRolesByIds, findUserById, getRoleIdsForUser, getUserRoles } from "../queries.js";

export async function addUserRoles(input: AddUserRolesInput) {
  const { id: userId, roleIds } = parseWith(AddUserRolesInput, input);
  const user = await findUserById(userId);
  if (!user) throw new DomainError("User not found", "NOT_FOUND");

  const uniqueIds = Array.from(new Set(roleIds));
  const roles = await findRolesByIds(uniqueIds);
  if (roles.length !== uniqueIds.length) {
    throw new DomainError("Some roles not found", "NOT_FOUND");
  }

  const current = new Set(await getRoleIdsForUser(userId));
  const toAdd = uniqueIds.filter((rid) => !current.has(rid));
  if (toAdd.length) await addRoles(userId, toAdd);

  const assigned = await getUserRoles(userId);
  return { userId, roles: assigned };
}

