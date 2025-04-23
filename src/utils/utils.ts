import { nanoid } from 'nanoid'
import { QuoteItem } from '@/types/quote'

export function ensureQuoteItemIds(items: QuoteItem[]): QuoteItem[] {
  return items.map((item) => ({
    ...item,
    id: item.id ?? nanoid(),
  }))
}