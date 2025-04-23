'use client'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/formatCurrency'
import { QuoteItem } from '@/types/quote'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type Props = {
  items: QuoteItem[]
  markupPercentage: number
  includedOptions: Record<string, boolean>
  setIncludedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export default function QuoteSummary({
  items,
  markupPercentage,
  includedOptions,
  setIncludedOptions,
}: Props) {
  // get all unique option labels
  const optionLabels = Array.from(
    new Set(items.map(i => i.optionLabel).filter(Boolean))
  ) as string[]

  // calculate total for each option
  const optionTotals = optionLabels.map(label => {
    const total = items
      .filter(i => i.optionLabel === label)
      .reduce((sum, i) => sum + i.total, 0)
    return { label, total }
  })

  // total of selected options
  const includedTotal = optionTotals.reduce((sum, opt) => {
    return includedOptions[opt.label] ? sum + opt.total : sum
  }, 0)

  const markup = includedTotal * (markupPercentage / 100)
  const gst = (includedTotal + markup) * 0.1
  const profit = markup
  const grandTotal = includedTotal + markup + gst

  const handleToggle = (label: string, checked: boolean | "indeterminate") => {
    if (typeof checked !== "boolean") return
    setIncludedOptions(prev => ({
      ...prev,
      [label]: checked,
    }))
  }

  return (
    <Card className="w-full max-w-xl ml-auto p-6 space-y-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Quote Summary</h3>

      <div className="space-y-2 text-sm">
        {optionTotals.map((opt, i) => {
          const isChecked = includedOptions[opt.label] ?? true

          return (
            <div key={opt.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(val) => handleToggle(opt.label, val)}
                />
                <Label className="font-medium">
                  Option {i + 1}: {opt.label}
                </Label>
              </div>
              <span>{formatCurrency(opt.total)}</span>
            </div>
          )
        })}
      </div>

      <Separator className="my-3" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(includedTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Markup ({markupPercentage}%)</span>
          <span>{formatCurrency(markup)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Profit</span>
          <span>{formatCurrency(profit)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (10%)</span>
          <span>{formatCurrency(gst)}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between text-base font-bold">
        <span>Total (incl. GST)</span>
        <span>{formatCurrency(grandTotal)}</span>
      </div>
    </Card>
  )
}



