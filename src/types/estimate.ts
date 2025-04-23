import { z } from 'zod'

// ---------------------------------------------
// 🔐 Zod schema for form validation
// ---------------------------------------------

export const formSchema = z.object({
  customerId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string().email(),
  jobsiteAddress: z.object({
    street: z.string(),
    suburb: z.string(),
    postcode: z.string(),
    state: z.string(),
  }),
  details: z.string().optional(),
  jobNotes: z.string().optional(),

  additionalItems: z
    .array(
      z.object({
        description: z.string().optional(),
        quantity: z.union([z.string(), z.number()]).optional(),
        unitPrice: z.union([z.string(), z.number()]).optional(),
      })
    )
    .optional(),

  options: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      totalSqm: z.coerce.number(),
      equipment: z.array(
        z.object({
          item: z.string(),
          category: z.enum(['Prep', 'Bitumen', 'Asphalt']),
          price: z.coerce.number().optional(),
          units: z.coerce.number(),
          hours: z.coerce.number(),
          days: z.coerce.number(),
        })
      ),
      materials: z.array(
        z.object({
          item: z.string(),
          type: z.string(),
          sqm: z.coerce.number().optional(),
          sprayRate: z.coerce.number(),
          price: z.coerce.number().optional(),
        })
      ),
      shapeEntries: z.array(
        z.object({
          id: z.string(),
          shape: z.enum(['rectangle', 'triangle', 'trapezoid']),
          label: z.string(),
          values: z.array(z.string()),
          areaTypes: z.array(z.string()),
          area: z.number().optional(),
        })
      ),
    })
  ),
})

export type FormData = z.infer<typeof formSchema>
export type EstimateOption = FormData['options'][number]

export type Estimate = {
  id: string
  ref: string
  firstName: string
  lastName: string
  customerEmail: string
  phone?: string
  customerId?: string // ✅ used in quote generation
  leadId?: string
  jobsiteAddress: {
    street: string
    suburb: string
    postcode: string
    state: string
  }
  details?: string
  jobNotes?: string
  additionalItems?: {
    description?: string
    quantity?: number | string
    unitPrice?: number | string
  }[]
  options: EstimateOption[]
  createdAt: string
  createdAtFormatted: string
}


