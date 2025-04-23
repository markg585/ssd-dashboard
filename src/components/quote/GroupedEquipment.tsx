'use client'

import { QuoteItem } from '@/types/quote'
import { formatCurrency } from '@/utils/formatCurrency'
import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'

type Props = {
  equipmentItems: QuoteItem[]
}

export default function GroupedEquipment({ equipmentItems }: Props) {
  const { control, watch } = useFormContext()
  const grouped = groupByCategory(equipmentItems)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="font-semibold text-muted-foreground mb-2">{category}</h4>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 w-[200px]">Item</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2 w-[80px]">Units</th>
                  <th className="text-right p-2 w-[80px]">Hours</th>
                  <th className="text-right p-2 w-[80px]">Days</th>
                  <th className="text-right p-2 w-[120px]">Unit Price</th>
                  <th className="text-right p-2 w-[120px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const fieldName = `items.${item.id}`
                  const values = watch(fieldName)

                  const unit = Number(values?.unit ?? 0)
                  const hours = Number(values?.hours ?? 0)
                  const days = Number(values?.days ?? 0)
                  const unitPrice = Number(values?.unitPrice ?? 0)
                  const total = unit * hours * days * unitPrice

                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.label}</td>
                      <td className="p-2 text-muted-foreground">{item.description}</td>

                      {['unit', 'hours', 'days', 'unitPrice'].map((field) => (
                        <td key={field} className="p-2 text-right">
                          <Controller
                            name={`${fieldName}.${field}`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min={0}
                                className="w-full text-right"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </td>
                      ))}

                      <td className="p-2 text-right font-medium">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByCategory(items: QuoteItem[]) {
  return items.reduce<Record<string, QuoteItem[]>>((acc, item) => {
    const key = item.category || 'Other'
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})
}
