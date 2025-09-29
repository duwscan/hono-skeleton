import { DomainError } from "../../../core/result.js";
import { UpdateRoleNameInput } from "../schema.js";
import { parseWith } from "../../../core/validator.js";
import { ensureUniqueSlug } from "./slug.js";
import { findRoleById, updateRoleById } from "../queries.js";

export async function updateRoleName(input: UpdateRoleNameInput) {
  const { id, name } = parseWith(UpdateRoleNameInput, input);
  const exists = await findRoleById(id);
  if (!exists) {
    throw new DomainError("Role not found", "NOT_FOUND");
  }
  let slug: string | undefined = undefined;
  if (name !== exists.name) {
    slug = await ensureUniqueSlug(name);
  }
  const updated = await updateRoleById(id, { name, slug });
  if (!updated) {
    throw new DomainError("Failed to update role name", "UPDATE_FAILED");
  }
  return updated;
}

