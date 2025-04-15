import { z } from 'zod'

// ---------------------------------------------
// 🔐 Zod schema for form validation
// ---------------------------------------------

export const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    suburb: z.string(),
    postcode: z.string(),
    state: z.string(),
  }),
  details: z.string().optional(),
  options: z.record(
    z.object({
      totalSqm: z.coerce.number(),
      equipment: z.array(z.object({
        item: z.string(),
        category: z.enum(['Prep', 'Bitumen', 'Asphalt']),
        price: z.coerce.number().optional(),
        units: z.coerce.number(),
        hours: z.coerce.number(),
        days: z.coerce.number(),
      })),
      materials: z.array(z.object({
        item: z.string(),
        type: z.string(),
        sqm: z.coerce.number(),
        sprayRate: z.coerce.number(),
        price: z.coerce.number(),
      })),
      shapeEntries: z.array(z.object({
        id: z.string(),
        shape: z.enum(['rectangle', 'triangle', 'trapezoid']),
        label: z.string(),
        values: z.array(z.string()),
        areaTypes: z.array(z.string()),
        area: z.number().optional(),
      })),
    })
  )
})

export type FormData = z.infer<typeof formSchema>

export type EstimateOption = FormData['options'][string]

export type Estimate = {
  id: string
  ref: string
  firstName: string
  lastName: string
  customerEmail: string
  phone?: string
  address: {
    street: string
    suburb: string
    postcode: string
    state: string
  }
  createdAt: string
  createdAtFormatted: string
  options: Record<string, EstimateOption>
  details?: string
}

