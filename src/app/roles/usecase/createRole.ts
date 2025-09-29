import { CreateRoleInput } from "../schema.js";
import { parseWith } from "../../../core/validator.js";
import { ensureUniqueSlug } from "./slug.js";
import { insertRole } from "../queries.js";

export async function createRole(input: CreateRoleInput) {
  const { name, description } = parseWith(CreateRoleInput, input);
  const slug = await ensureUniqueSlug(name);
  const role = await insertRole({ name, slug, description });
  return role;
}
