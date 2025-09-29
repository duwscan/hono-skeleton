import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import {
  AddRolePermissionsInput,
  type AddRolePermissionsInput as AddInput,
} from "../schema.js";
import {
  addRolePermissions as addRolePerms,
  findPermissionsByIds,
  findRoleById,
  getPermissionIdsForRole,
  getRolePermissions,
} from "../queries.js";

export async function addRolePermissions(input: AddInput) {
  const { id: roleId, permissionIds } = parseWith(AddRolePermissionsInput, input);

  const role = await findRoleById(roleId);
  if (!role) throw new DomainError("Role not found", "NOT_FOUND");

  const uniqueIds = Array.from(new Set(permissionIds));
  const perms = await findPermissionsByIds(uniqueIds);
  if (perms.length !== uniqueIds.length) {
    throw new DomainError("Some permissions not found", "NOT_FOUND");
  }

  const current = new Set(await getPermissionIdsForRole(roleId));
  const toAdd = uniqueIds.filter((pid) => !current.has(pid));
  if (toAdd.length) await addRolePerms(roleId, toAdd);

  const assigned = await getRolePermissions(roleId);
  return { roleId, permissions: assigned };
}

