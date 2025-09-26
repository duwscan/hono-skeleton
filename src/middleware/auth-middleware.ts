import type { Context, Next } from "hono";
import { auth } from "../config/auth.js";
import { DomainError, err } from "../core/result.js";

export const authHandler = async (c: Context, next: Next) => {
    if(!c.req.raw.headers.get('Authorization')) {
        return c.json(err(new DomainError('Unauthorized', 'UNAUTHORIZED')), 401);
    }
    if(c.get('session')) {
        return next();
    }
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if(!session) {
        return c.json(err(new DomainError('Unauthorized', 'UNAUTHORIZED')), 401);
    }   
    c.set('session', session);
    c.set('user', session.user);
    return next();
}