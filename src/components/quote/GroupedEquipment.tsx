'use client'

import { QuoteItem } from '@/types/quote'
import { formatCurrency } from '@/utils/formatCurrency'
import { useFormContext, Controller, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'

type Props = {
  equipmentItems: QuoteItem[]
  allItems: QuoteItem[]
}

export default function GroupedEquipment({ equipmentItems, allItems }: Props) {
  const { control } = useFormContext()

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
                  <th className="text-left p-2">Estimate Entry</th>
                  <th className="text-right p-2 w-[80px]">Units</th>
                  <th className="text-right p-2 w-[80px]">Hours</th>
                  <th className="text-right p-2 w-[80px]">Days</th>
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

                  const baseName = `items.${itemIndex}`

                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2">{item.label}</td>
                      <td className="p-2 text-muted-foreground">{item.description}</td>
                      <td className="p-2 text-right">
                        <Controller
                          name={`${baseName}.units`}
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
                          name={`${baseName}.hours`}
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
                          name={`${baseName}.days`}
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
                          name={`${baseName}.quantity`}
                          control={control}
                          render={({ field, fieldState }) => {
                            const units = useWatch({ name: `${baseName}.units`, control }) || 0
                            const hours = useWatch({ name: `${baseName}.hours`, control }) || 0
                            const days = useWatch({ name: `${baseName}.days`, control }) || 0
                            const calculatedQty = units * hours * days
                            if (field.value !== calculatedQty) field.onChange(calculatedQty)
                            return (
                              <Input
                                {...field}
                                type="number"
                                disabled
                                className="w-full text-right bg-muted"
                                value={calculatedQty}
                              />
                            )
                          }}
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Controller
                          name={`${baseName}.unitPrice`}
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