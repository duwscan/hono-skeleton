import { relations } from "drizzle-orm/relations";
import { users, accounts, sessions } from "./schema.js";
import { permissions, roles } from "./schema.js";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]	
	}),
}));

// roles and permissions relations
export const rolesRelations = relations(roles, ({many}) => ({
	permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	roles: many(roles),
}));