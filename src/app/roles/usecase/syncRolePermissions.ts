import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import {
  SyncRolePermissionsInput,
  type SyncRolePermissionsInput as SyncInput,
} from "../schema.js";
import {
  addRolePermissions,
  findPermissionsByIds,
  findRoleById,
  getPermissionIdsForRole,
  getRolePermissions,
  removeRolePermissions,
} from "../queries.js";

export async function syncRolePermissions(input: SyncInput) {
  const { id: roleId, permissionIds } = parseWith(SyncRolePermissionsInput, input);

  const role = await findRoleById(roleId);
  if (!role) {
    throw new DomainError("Role not found", "NOT_FOUND");
  }

  // Validate provided permission ids exist
  const uniqueIds = Array.from(new Set(permissionIds));
  const perms = await findPermissionsByIds(uniqueIds);
  if (perms.length !== uniqueIds.length) {
    throw new DomainError("Some permissions not found", "NOT_FOUND");
  }

  // Compute diff vs current
  const current = new Set(await getPermissionIdsForRole(roleId));
  const desired = new Set(uniqueIds);

  const toAdd: number[] = [];
  const toRemove: number[] = [];

  for (const pid of desired) {
    if (!current.has(pid)) toAdd.push(pid);
  }
  for (const pid of current) {
    if (!desired.has(pid)) toRemove.push(pid);
  }

  // Apply changes
  if (toAdd.length) await addRolePermissions(roleId, toAdd);
  if (toRemove.length) await removeRolePermissions(roleId, toRemove);

  // Return final assigned permissions
  const assigned = await getRolePermissions(roleId);
  return {
    roleId,
    permissions: assigned,
  };
}

