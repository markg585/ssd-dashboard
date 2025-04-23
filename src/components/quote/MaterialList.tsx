'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { QuoteItem } from '@/types/quote'
import { Estimate } from '@/types/estimate'
import { formatCurrency } from '@/utils/formatCurrency'
import { calculateMaterialQuantity } from '@/utils/calculateMaterialQuantity'
import { useEffect } from 'react'

type Props = {
  materials: QuoteItem[]
  allItems: QuoteItem[]
  initialEstimate: Estimate
  materialMap: Map<string, any>
}

export default function MaterialList({ materials, allItems, initialEstimate, materialMap }: Props) {
  const { control, setValue, watch } = useFormContext()

  if (materials.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 w-[200px]">Item</th>
              <th className="text-left p-2">Description</th>
              <th className="text-right p-2 w-[80px]">Sqm</th>
              <th className="text-right p-2 w-[80px]">Rate</th>
              <th className="text-right p-2 w-[80px]">Qty</th>
              <th className="text-right p-2 w-[120px]">Unit Price</th>
              <th className="text-right p-2 w-[120px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item, i) => {
              const base = `items.${item.id}`

              const option = initialEstimate.options.find(o => o.label === item.optionLabel)
              const estimateMaterial = option?.materials?.find(m => m.item === item.label)
              const defaultSprayRate = Number(estimateMaterial?.sprayRate || 1)

              const firestoreMaterial = materialMap.get(item.label.toLowerCase())
              const formula = Number(firestoreMaterial?.formula || 1)
              const type = firestoreMaterial?.type as 'Bitumen' | 'Asphalt' | 'Roadbase' | 'Stone'

              const sqm = watch(`${base}.sqm`) || 0
              const sprayRate = watch(`${base}.sprayRate`) ?? defaultSprayRate
              const unitPrice = watch(`${base}.unitPrice`) ?? Number(item.unitPrice || 0)

              const quantity = calculateMaterialQuantity({ sqm, sprayRate, formula, type })

              // Ensure RHF knows the live values
              useEffect(() => {
                if (!isNaN(quantity)) {
                  setValue(`${base}.quantity`, Number(quantity))
                  setValue(`${base}.total`, Number(quantity * unitPrice))
                }
              }, [quantity, unitPrice, setValue, base])

              return (
                <tr key={i} className="border-t">
                  <td className="p-2">{item.label}</td>
                  <td className="p-2 text-muted-foreground">{item.description}</td>

                  {/* Sqm input */}
                  <td className="p-2 text-right">
                    <Controller
                      name={`${base}.sqm`}
                      control={control}
                      defaultValue={sqm}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          className="h-8 px-2 text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </td>

                  {/* Spray Rate input */}
                  <td className="p-2 text-right">
                    <Controller
                      name={`${base}.sprayRate`}
                      control={control}
                      defaultValue={sprayRate}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="h-8 px-2 text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </td>

                  {/* Quantity (calculated only, no input) */}
                  <td className="p-2 text-right">
                    {quantity.toFixed(2)}
                  </td>

                  {/* Unit Price input */}
                  <td className="p-2 text-right">
                    <Controller
                      name={`${base}.unitPrice`}
                      control={control}
                      defaultValue={Number(item.unitPrice || 0)}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="h-8 px-2 text-right"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                  </td>

                  {/* Total (live preview) */}
                  <td className="p-2 text-right font-medium">
                    {formatCurrency(quantity * unitPrice)}
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
