'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFormContext, useFieldArray } from 'react-hook-form'
import type { FormData } from './JobEstimateForm'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getMaterialsList } from '@/lib/firestore'
import { Trash2 } from 'lucide-react'

type Props = {
  optionIndex: number
}

export default function MaterialsSection({ optionIndex }: Props) {
  const { control, register, setValue } = useFormContext<FormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `options.${optionIndex}.materials` as const,
  })

  const [materialOptions, setMaterialOptions] = useState<{ item: string; type: string }[]>([])

  useEffect(() => {
    getMaterialsList().then((data) =>
      setMaterialOptions(data.sort((a, b) => a.item.localeCompare(b.item)))
    )
  }, [])

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
                sprayRate: 0, // ✅ Safe default
              })
            }
          >
            + Add Material
          </Button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-12 gap-3 items-end border rounded-lg p-3"
            >
              <div className="md:col-span-4 space-y-1">
                <Label>Item</Label>
                <Select
                  onValueChange={(val) => {
                    const found = materialOptions.find((m) => m.item === val)
                    setValue(`options.${optionIndex}.materials.${index}.item`, val)
                    if (found) {
                      setValue(`options.${optionIndex}.materials.${index}.type`, found.type)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialOptions.map((mat) => (
                      <SelectItem key={mat.item} value={mat.item}>
                        {mat.item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <Label>Type</Label>
                <Input
                  readOnly
                  tabIndex={-1}
                  className="focus-visible:ring-0 focus-visible:ring-transparent"
                  {...register(`options.${optionIndex}.materials.${index}.type`)}
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <Label>Spray Rate / Depth</Label>
                <Input
                  type="number"
                  step="any"
                  {...register(`options.${optionIndex}.materials.${index}.sprayRate`)}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = ''
                    }
                  }}
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
