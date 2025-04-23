import { QuoteItem } from "@/types/quote"

export function calculateTotals(items: QuoteItem[], markup: number) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const markupAmount = subtotal * (markup / 100)
  const gst = (subtotal + markupAmount) * 0.1
  const total = subtotal + markupAmount + gst

  return {
    subtotal,
    markupAmount,
    gst,
    total,
  }
}
