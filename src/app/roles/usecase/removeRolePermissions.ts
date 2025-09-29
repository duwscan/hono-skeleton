import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import {
  RemoveRolePermissionsInput,
  type RemoveRolePermissionsInput as RemoveInput,
} from "../schema.js";
import {
  findRoleById,
  getPermissionIdsForRole,
  getRolePermissions,
  removeRolePermissions as removeRolePerms,
} from "../queries.js";

export async function removeRolePermissions(input: RemoveInput) {
  const { id: roleId, permissionIds } = parseWith(RemoveRolePermissionsInput, input);

  const role = await findRoleById(roleId);
  if (!role) throw new DomainError("Role not found", "NOT_FOUND");

  const current = new Set(await getPermissionIdsForRole(roleId));
  const toRemove = Array.from(new Set(permissionIds)).filter((pid) => current.has(pid));
  if (toRemove.length) await removeRolePerms(roleId, toRemove);

  const assigned = await getRolePermissions(roleId);
  return { roleId, permissions: assigned };
}

