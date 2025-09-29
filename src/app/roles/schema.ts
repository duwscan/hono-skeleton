import { z } from "zod";

export const CreateRoleInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateRoleInput = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type CreateRoleInput = z.infer<typeof CreateRoleInput>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleInput>;

export const UpdateRoleNameInput = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

export type UpdateRoleNameInput = z.infer<typeof UpdateRoleNameInput>;

export const SyncRolePermissionsInput = z.object({
  id: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()).default([]),
});

export type SyncRolePermissionsInput = z.infer<typeof SyncRolePermissionsInput>;

export const AddRolePermissionsInput = z.object({
  id: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()).min(1),
});

export type AddRolePermissionsInput = z.infer<typeof AddRolePermissionsInput>;

export const RemoveRolePermissionsInput = z.object({
  id: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()).min(1),
});

export type RemoveRolePermissionsInput = z.infer<typeof RemoveRolePermissionsInput>;
