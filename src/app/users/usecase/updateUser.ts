import { DomainError } from "../../../core/result.js";
import { parseWith } from "../../../core/validator.js";
import { UpdateUserInput } from "../schema.js";
import { findUserById, updateUserById } from "../queries.js";

export async function updateUser(input: UpdateUserInput) {
  const { id, name, image } = parseWith(UpdateUserInput, input);
  const exists = await findUserById(id);
  if (!exists) throw new DomainError("User not found", "NOT_FOUND");
  const updated = await updateUserById(id, { name, image: image ?? undefined });
  if (!updated) throw new DomainError("Failed to update user", "UPDATE_FAILED");
  return updated;
}

