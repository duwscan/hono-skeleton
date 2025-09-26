import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { DomainError } from './result.js';
export const domainErrorToHttp = (e: DomainError) => {
  const map: Record<string, number> = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403
  };
  return (map[e.code] ?? 500) as ContentfulStatusCode;
};