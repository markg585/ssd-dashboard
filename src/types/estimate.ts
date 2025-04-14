import { z } from 'zod'

// ---------------------------------------------
// 🔐 Zod schema for form validation
// ---------------------------------------------

export const formSchema = z.object({
  customerName: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
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
        area: z.number().optional(), // this gets injected before saving
      })),
    })
  )
})

// ---------------------------------------------
// 🧠 Types
// ---------------------------------------------

export type FormData = z.infer<typeof formSchema>

export type EstimateOption = FormData['options'][string]

export type Estimate = {
  id: string
  ref: string
  customerName: string
  customerEmail: string
  address: string
  createdAt: string
  createdAtFormatted: string
  options: Record<string, EstimateOption>
  details?: string
}
