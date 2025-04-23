'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/formatCurrency'
import { calculateTotals } from '@/utils/calculateTotals'
import { QuoteItem } from '@/types/quote'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type Props = {
  items: QuoteItem[]
  includedOptions: Record<string, boolean>
  setIncludedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

export default function QuoteSummary({
  items,
  includedOptions,
  setIncludedOptions,
}: Props) {
  const { watch, control } = useFormContext()
  const itemsMap = watch('items') || {}
  const markupPercentage = watch('markupPercentage') || 0

  const totals = calculateTotals({
    items,
    itemsMap,
    includedOptions,
    markupPercentage,
  })

  const optionLabels = Array.from(
    new Set(items.map((i) => i.optionLabel).filter(Boolean))
  ) as string[]

  const handleToggle = (label: string, checked: boolean | 'indeterminate') => {
    if (typeof checked !== 'boolean') return
    setIncludedOptions((prev) => ({
      ...prev,
      [label]: checked,
    }))
  }

  return (
    <Card className="w-full max-w-xl ml-auto p-6 space-y-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Quote Summary</h3>

      {/* Markup % input */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Markup %</Label>
        <Controller
          name="markupPercentage"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min={0}
              max={100}
              className="w-[80px] h-8 text-right"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* Option toggles */}
      <div className="space-y-2 text-sm">
        {optionLabels.map((label, i) => {
          const isChecked = includedOptions[label] ?? true
          return (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(val) => handleToggle(label, val)}
                />
                <Label className="font-medium">
                  Option {i + 1}: {label}
                </Label>
              </div>
            </div>
          )
        })}
      </div>

      <Separator className="my-3" />

      {/* Totals */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Markup ({markupPercentage}%)</span>
          <span>{formatCurrency(totals.markup)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Profit</span>
          <span>{formatCurrency(totals.profit)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST (10%)</span>
          <span>{formatCurrency(totals.gst)}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between text-base font-bold">
        <span>Total (incl. GST)</span>
        <span>{formatCurrency(totals.grandTotal)}</span>
      </div>
    </Card>
  )
}

