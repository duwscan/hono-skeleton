import type { Context, Next } from "hono";

export const statelessHandler = async (c: Context, next: Next) => {
    // remove cookies
    c.req.raw.headers.forEach((value, key) => {
        if(key.toLowerCase().includes('cookie')) {
            c.req.raw.headers.delete(key);
        }
    });
    return next();
}   