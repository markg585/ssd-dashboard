'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form'

type Material = {
  item: string
  type: string
  sqm: number
  sprayRate: number
  price: number
}

type Props = {
  control: Control<{ materials: Material[] }>
  register: UseFormRegister<{ materials: Material[] }>
}

export default function MaterialsSection({ control, register }: Props) {
  const { fields, append } = useFieldArray({
    control,
    name: 'materials',
  })

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <h2 className="text-lg font-semibold">Materials</h2>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-5 gap-2">
            <Input placeholder="Item" {...register(`materials.${index}.item`)} />
            <Input placeholder="Type" {...register(`materials.${index}.type`)} />
            <Input type="number" placeholder="SQM" {...register(`materials.${index}.sqm`, { valueAsNumber: true })} />
            <Input type="number" placeholder="Spray Rate" {...register(`materials.${index}.sprayRate`, { valueAsNumber: true })} />
            <Input type="number" placeholder="Price" {...register(`materials.${index}.price`, { valueAsNumber: true })} />
          </div>
        ))}

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
      </CardContent>
    </Card>
  )
}
