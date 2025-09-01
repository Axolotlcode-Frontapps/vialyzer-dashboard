import { z } from 'zod/v4'

class Settings {
  role = z.object({
    name: z.string().min(1, { error: 'El nombre es obligatorio' }),
    description: z.string().min(1, { error: 'La descripción es obligatoria' }),
  })

  user = z.object({
    name: z.string().min(1, { error: 'El nombre es obligatorio' }),
    lastname: z.string().min(1, { error: 'El apellido es obligatorio' }),
    email: z.email({ error: 'El email es obligatorio' }),
    phone: z.string(),
    role: z.string().min(1, { error: 'El rol es obligatorio' }),
    company: z.string().min(1, { error: 'La empresa es obligatoria' }),
  })

  company = z.object({
    name: z.string().min(1, { error: 'El nombre es obligatorio' }),
    description: z.string().min(1, { error: 'La descripción es obligatoria' }),
    nit: z.string().min(1, { error: 'El NIT es obligatorio' }),
    phone: z.string().min(1, { error: 'El teléfono es obligatorio' }),
    address: z.string().min(1, { error: 'La dirección es obligatoria' }),
    department: z.string().min(1, { error: 'El departamento es obligatorio' }),
    city: z.string().min(1, { error: 'La ciudad es obligatoria' }),
  })

  searchRoles = z.object({
    module: z.string().optional(),
  })
}

export const settingsSchemas = new Settings()

export type RoleValues = z.infer<typeof settingsSchemas.role>
export type UserValues = z.infer<typeof settingsSchemas.user>
export type CompanyValues = z.infer<typeof settingsSchemas.company>
export type SearchRolesValues = z.infer<typeof settingsSchemas.searchRoles>
