import type { Context, Next } from "hono";
import { DomainError, err } from "../core/result.js";
import { getUserPermissions, getUserRoles } from "../app/users/queries.js";

export const rolesMiddleware = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user');
        if(!user) {
            return c.json(err(new DomainError('Unauthorized', 'UNAUTHORIZED')), 401);
        }
        const userRoles = await getUserRoles(user.id);
        if(!userRoles.some(role => roles.includes(role.slug))) {
            return c.json(err(new DomainError('Forbidden', 'FORBIDDEN')), 403);
        }
        return next();
    }
}

export const permissionsMiddleware = (permissions: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user');
        if(!user) {
            return c.json(err(new DomainError('Unauthorized', 'UNAUTHORIZED')), 401);
        }
        const userPermissions = await getUserPermissions(user.id);
        if(!userPermissions.some(permission => permissions.includes(permission.slug))) {
            return c.json(err(new DomainError('Forbidden', 'FORBIDDEN')), 403);
        }
        return next();
    }
}
