import { z } from 'zod/v4'

class Settings {
  role = z.object({
    name: z.string({ error: 'El nombre es obligatorio' }),
    description: z.string({ error: 'La descripción es obligatoria' }),
    active: z.boolean().optional(),
  })

  user = z.object({
    name: z.string({ error: 'El nombre es obligatorio' }),
    lastName: z.string({ error: 'El apellido es obligatorio' }),
    email: z.email({ error: 'El email es obligatorio' }),
    phone: z.string({ error: 'El teléfono es obligatorio' }),
    role: z.string({ error: 'El rol es obligatorio' }),
    company: z.string({ error: 'La empresa es obligatoria' }),
  })

  company = z.object({
    name: z.string({ error: 'El nombre es obligatorio' }),
    nit: z.string({ error: 'El NIT es obligatorio' }),
    phone: z.string({ error: 'El teléfono es obligatorio' }),
    address: z.string({ error: 'La dirección es obligatoria' }),
    department: z.string({ error: 'El departamento es obligatorio' }),
    city: z.string({ error: 'La ciudad es obligatoria' }),
    description: z.string({ error: 'La descripción es obligatoria' }),
  })
}

export const settingsSchemas = new Settings()

export type RoleValues = z.infer<typeof settingsSchemas.role>
export type UserValues = z.infer<typeof settingsSchemas.user>
export type CompanyValues = z.infer<typeof settingsSchemas.company>
