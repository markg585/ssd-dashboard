'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFormContext, useFieldArray } from 'react-hook-form'
import type { FormData } from './JobEstimateForm'

type Props = {
  optionKey: string
}

export default function MaterialsSection({ optionKey }: Props) {
  const { control, register } = useFormContext<FormData>()
  const fieldPrefix = `options.${optionKey}.materials` as const

  const { fields, append } = useFieldArray({
    control,
    name: fieldPrefix satisfies `options.${string}.materials`,
  })

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Materials</h2>
          <Button
            type="button"
            onClick={() =>
              append({
                item: '',
                type: '',
                sqm: 0,
                sprayRate: 0,
                price: 0,
              })
            }
          >
            + Add Material
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
            <Input
              placeholder="Item"
              {...register(`${fieldPrefix}.${index}.item`)}
            />
            <Input
              placeholder="Type"
              {...register(`${fieldPrefix}.${index}.type`)}
            />
            <Input
              type="number"
              placeholder="SQM"
              {...register(`${fieldPrefix}.${index}.sqm`, { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Spray Rate"
              {...register(`${fieldPrefix}.${index}.sprayRate`, { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Price"
              {...register(`${fieldPrefix}.${index}.price`, { valueAsNumber: true })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
