import { z } from 'zod';
import { DomainError } from './result.js';

import type { ValidationTargets } from 'hono'
import { zValidator as zv } from '@hono/zod-validator'

export function parseWith<T extends z.ZodTypeAny>(schema: T, input: unknown) {
  const r = schema.safeParse(input);
  if (!r.success) {
    const tree = z.treeifyError(r.error);
    throw new DomainError('Validation failed', 'VALIDATION_ERROR', tree);
  }
  return r.data as z.infer<T>;
}



export const zValidator = <T extends z.ZodTypeAny, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      const tree = z.treeifyError(result.error);
      throw new DomainError('Validation failed', 'VALIDATION_ERROR', tree)
    }
  })

export const jsonRequestValidator = <T extends z.ZodTypeAny>(schema: T) => zValidator(
  "json",
  schema
)