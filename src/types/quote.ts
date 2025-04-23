export type QuoteItem = {
  optionLabel?: string // Used to group by Option
  label: string
  type: 'material' | 'equipment' | 'other'
  description: string
  quantity: number
  unit?: string
  unitCost?: number
  unitPrice: number
  total: number
  category?: 'Prep' | 'Bitumen' | 'Asphalt' // Only for equipment
  sqm?: number // ✅ Manual sqm input for material calculations
  sprayRate?: number // Editable sprayRate/depth (for material)
}

export type Quote = {
  id: string
  estimateId: string
  customerId: string
  customerName: string
  jobsiteAddress: {
    street: string
    suburb: string
    state: string
    postcode: string
  }
  items: QuoteItem[]
  additionalItems?: QuoteItem[]
  markupPercentage: number
  profit: number
  gst: number
  total: number
  notes?: string
  features?: string[]
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}
