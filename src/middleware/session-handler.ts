import type { Context, Next } from "hono"
import { auth } from "../config/auth.js";

export const sessionHandler = async (c: Context, next: Next) => {
    console.log("c.req.raw.headers", c.req.raw.headers);
    if(!c.req.raw.headers.get('Authorization')) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }
    const session = await auth.api.getSession({ headers: c.req.raw.headers });      
    if (!session) {
    	c.set("user", null);
    	c.set("session", null);
    	return next();
  	}
  	c.set("user", session.user);
  	c.set("session", session.session);
  	return next();
}       