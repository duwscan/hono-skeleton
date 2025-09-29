import { z } from "zod";

export const UpdatePermissionInput = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type UpdatePermissionInput = z.infer<typeof UpdatePermissionInput>;

