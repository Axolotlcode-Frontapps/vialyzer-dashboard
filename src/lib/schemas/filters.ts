import { z } from 'zod/v4'

class FiltersSchemas {
  map = z.object({
    selected: z.string().optional(),
  })
}

export const filtersSchemas = new FiltersSchemas()

export type MapValues = z.infer<typeof filtersSchemas.map>
