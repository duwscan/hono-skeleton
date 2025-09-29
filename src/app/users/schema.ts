import { z } from "zod";

export const CreateUserInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  image: z.string().url().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  image: z.string().url().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export const SyncUserRolesInput = z.object({
  id: z.string().min(1),
  roleIds: z.array(z.number().int().positive()).default([]),
});

export type SyncUserRolesInput = z.infer<typeof SyncUserRolesInput>;

export const AddUserRolesInput = z.object({
  id: z.string().min(1),
  roleIds: z.array(z.number().int().positive()).min(1),
});

export type AddUserRolesInput = z.infer<typeof AddUserRolesInput>;

export const RemoveUserRolesInput = z.object({
  id: z.string().min(1),
  roleIds: z.array(z.number().int().positive()).min(1),
});

export type RemoveUserRolesInput = z.infer<typeof RemoveUserRolesInput>;
