// email password signup schema
import { z } from 'zod/v4'

export const emailPasswordSignupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string(),
})