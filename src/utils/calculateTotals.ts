import { QuoteItem } from '@/types/quote'

type ItemInput = {
  unit?: number
  hours?: number
  days?: number
  quantity?: number
  unitPrice?: number
  sqm?: number
  sprayRate?: number
}

type TotalsInput = {
  items: QuoteItem[]
  itemsMap: Record<string, ItemInput>
  includedOptions: Record<string, boolean>
  markupPercentage: number
}

export function calculateTotals({
  items,
  itemsMap,
  includedOptions,
  markupPercentage,
}: TotalsInput) {
  let subtotal = 0

  for (const item of items) {
    const input = itemsMap[item.id]
    if (!input) continue
    if (!includedOptions[item.optionLabel ?? '']) continue

    const unitPrice = Number(input.unitPrice ?? 0)
    let total = 0

    switch (item.type) {
      case 'equipment': {
        const unit = Number(input.unit ?? 0)
        const hours = Number(input.hours ?? 0)
        const days = Number(input.days ?? 0)
        total = unit * hours * days * unitPrice
        break
      }

      case 'material': {
        // Quantity is already calculated and written into form state
        const quantity = Number(input.quantity ?? 0)
        total = quantity * unitPrice
        break
      }

      case 'other': {
        const quantity = Number(input.quantity ?? 0)
        total = quantity * unitPrice
        break
      }
    }

    subtotal += total
  }

  const markup = subtotal * (markupPercentage / 100)
  const gst = (subtotal + markup) * 0.1
  const profit = markup
  const grandTotal = subtotal + markup + gst

  return {
    subtotal,
    markup,
    gst,
    profit,
    grandTotal,
  }
}

