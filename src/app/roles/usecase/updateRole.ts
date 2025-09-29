import { DomainError } from "../../../core/result.js";
import { UpdateRoleInput } from "../schema.js";
import { parseWith } from "../../../core/validator.js";
import { ensureUniqueSlug } from "./slug.js";
import { findRoleById, updateRoleById } from "../queries.js";

export async function updateRole(input: UpdateRoleInput) {
  const { id, name, description } = parseWith(UpdateRoleInput, input);
  const exists = await findRoleById(id);
  if (!exists) {
    throw new DomainError("Role not found", "NOT_FOUND");
  }

  let slug: string | undefined = undefined;
  if (name && name !== exists.name) {
    slug = await ensureUniqueSlug(name);
  }

  const updated = await updateRoleById(id, { name, description, slug });
  if (!updated) {
    throw new DomainError("Failed to update role", "UPDATE_FAILED");
  }
  return updated;
}
