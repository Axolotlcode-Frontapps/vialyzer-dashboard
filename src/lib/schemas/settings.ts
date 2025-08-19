import { z } from 'zod/v4'

class Settings {
  role = z.object({
    name: z.string({ error: 'El nombre es obligatorio' }),
    description: z.string({ error: 'La descripción es obligatoria' }),
    active: z.boolean().optional(),
  })
}

export const settingsSchemas = new Settings()

export type RoleValues = z.infer<typeof settingsSchemas.role>
