
import type { Hono } from "hono";
import type { RequestContext } from "../types/RequestContext.js";
import errorHandler from "./errors-handler.js";
import { sessionHandler } from "./session-handler.js";
import { statelessHandler } from "./stateless-handler.js";
import { logger } from "hono/logger";
import { authHandler } from "./auth-middleware.js";

export const bootstrapMiddlewares = (app: Hono<RequestContext>) => {
    app.use('*', statelessHandler)
    app.use('*', sessionHandler)
    app.use('*', errorHandler)
}

export const middlewares= {
    auth: authHandler,
}