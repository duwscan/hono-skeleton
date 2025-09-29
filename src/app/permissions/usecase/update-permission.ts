import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import { UpdatePermissionInput } from "../schema.js";
import { findPermissionById, updatePermissionById } from "../queries.js";

export async function updatePermission(input: UpdatePermissionInput) {
  const { id, name, description } = parseWith(UpdatePermissionInput, input);
  const exists = await findPermissionById(id);
  if (!exists) {
    throw new DomainError("Permission not found", "NOT_FOUND");
  }

  const updated = await updatePermissionById(id, { name, description });
  if (!updated) {
    throw new DomainError("Failed to update permission", "UPDATE_FAILED");
  }
  return updated;
}

