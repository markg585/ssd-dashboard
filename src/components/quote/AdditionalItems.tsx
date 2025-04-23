'use client'

import { QuoteItem } from '@/types/quote'
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/formatCurrency'

type Props = {
  items: QuoteItem[]
  allItems: QuoteItem[]
}

export default function AdditionalItems({ items, allItems }: Props) {
  const { control } = useFormContext()

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 w-[200px]">Item</th>
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2 w-[80px]">Qty</th>
              <th className="text-right p-2 w-[120px]">Unit Price</th>
              <th className="text-right p-2 w-[120px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const itemIndex = allItems.findIndex(
                (i) =>
                  i.label === item.label &&
                  i.optionLabel === item.optionLabel &&
                  i.type === item.type
              )
              const base = `items.${itemIndex}`

              return (
                <tr key={i} className="border-t">
                  <td className="p-2">{item.label}</td>
                  <td className="p-2 text-muted-foreground">{item.description}</td>
                  <td className="p-2 text-right">
                    <Controller
                      name={`${base}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          className="w-full text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <Controller
                      name={`${base}.unitPrice`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min={0}
                          className="w-full text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </td>
                  <td className="p-2 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


