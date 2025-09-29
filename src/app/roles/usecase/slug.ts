import { findRoleBySlug } from "../queries.js";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function ensureUniqueSlug(base: string) {
  const baseSlug = slugify(base);
  let candidate = baseSlug;
  let i = 2;
  // Try suffixing -2, -3, ... until unique
  while (await findRoleBySlug(candidate)) {
    candidate = `${baseSlug}-${i}`;
    i++;
  }
  return candidate;
}

