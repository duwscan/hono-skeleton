import type { Context, Next } from "hono";
import { domainErrorToHttp } from "../core/errors.js";
import { DomainError, err, unknownErr } from "../core/result.js";

async function errorHandler(c: Context, next: Next) {
    try { await next(); }
    catch (e: unknown) {
      if (e instanceof DomainError) {
        const status = domainErrorToHttp(e);
        return c.json(err(e), status);
      }
      if (e instanceof Error) {
        return c.json(err(e), 500);
      }
      return c.json(unknownErr(e), 500);
    }
  }

  export default errorHandler;