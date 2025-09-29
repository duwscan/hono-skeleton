import { mysqlTable, primaryKey, varchar, text, timestamp, unique, tinyint, int } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const accounts = mysqlTable("accounts", {
	id: varchar({ length: 36 }).notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "accounts_id"}),
]);

export const sessions = mysqlTable("sessions", {
	id: varchar({ length: 36 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "sessions_id"}),
	unique("sessions_token_unique").on(table.token),
]);

export const users = mysqlTable("users", {
	id: varchar({ length: 36 }).notNull(),
	name: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
  emailVerified: tinyint("email_verified").default(0).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "users_id"}),
	unique("users_email_unique").on(table.email),
]);

export const verifications = mysqlTable("verifications", {
	id: varchar({ length: 36 }).notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "verifications_id"}),
]);

// adding roles table
export const roles = mysqlTable("roles", {
	id: int("id").autoincrement().notNull(),
	name: varchar({ length: 50 }).notNull(),
  slug: varchar({ length: 50 }).notNull(),
  description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "roles_id"}),
  unique("roles_slug_unique").on(table.slug),
]);
// adding permissions table 
export const permissions = mysqlTable("permissions", {
	id: int("id").autoincrement().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "permissions_id"}),
	unique("permissions_slug_unique").on(table.slug),
]);
// adding pivot table for roles and permissions
export const rolePermissions = mysqlTable("role_permissions", {
	id: int("id").autoincrement().notNull(),
	roleId: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" } ),
	permissionId: int("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "role_permissions_id"}),
]);
// adding pivot table for roles and users
export const roleUsers = mysqlTable("role_users", {
	id: int("id").autoincrement().notNull(),
	roleId: int("role_id").notNull().references(() => roles.id, { onDelete: "cascade" } ),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "role_users_id"}),
]);