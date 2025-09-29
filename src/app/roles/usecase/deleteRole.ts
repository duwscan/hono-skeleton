import { DomainError } from "../../../core/result.js";
import { deleteRoleById, findRoleById } from "../queries.js";

export async function deleteRole(id: number) {
  const exists = await findRoleById(id);
  if (!exists) {
    throw new DomainError("Role not found", "NOT_FOUND");
  }
  const deleted = await deleteRoleById(id);
  if (!deleted) {
    throw new DomainError("Failed to delete role", "DELETE_FAILED");
  }
  return { id };
}

