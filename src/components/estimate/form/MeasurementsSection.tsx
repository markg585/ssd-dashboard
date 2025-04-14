'use client'

import { useFormContext, useFieldArray } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

const AREA_TYPE_OPTIONS = ['Profiling', 'Road Base', 'Asphalt', 'Bitumen', 'Prime']

export type ShapeType = 'rectangle' | 'triangle' | 'trapezoid'

type ShapeEntry = {
  id: string
  shape: ShapeType
  label: string
  values: string[]
  areaTypes: string[]
}

type Props = {
  optionKey: string
}

export default function MeasurementsSection({ optionKey }: Props) {
  const { control, register, watch, setValue } = useFormContext()
  const fieldPath = `options.${optionKey}.shapeEntries`

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath,
  })

  const typedFields = fields as ShapeEntry[]
  const shapes = (watch(fieldPath) ?? []) as ShapeEntry[]
  const [activeTab, setActiveTab] = useState<ShapeType>('rectangle')

  const calculateArea = (entry: ShapeEntry): number => {
    const [a, b, c] = (entry.values ?? []).map((v) => parseFloat(v || '0'))
    switch (entry.shape) {
      case 'rectangle':
        return a * b
      case 'triangle':
        return 0.5 * a * b
      case 'trapezoid':
        return 0.5 * (a + b) * c
      default:
        return 0
    }
  }

  const totalArea = shapes.reduce((sum, entry) => sum + calculateArea(entry), 0)

  const areaByType = AREA_TYPE_OPTIONS.map((type) => {
    const total = shapes
      .filter((entry) => entry.areaTypes?.includes(type))
      .reduce((sum, entry) => sum + calculateArea(entry), 0)
    return { type, total }
  })

  const addShape = (shape: ShapeType) => {
    const id = crypto.randomUUID()
    const values = shape === 'trapezoid' ? ['', '', ''] : ['', '']
    append({
      id,
      shape,
      label: '',
      values,
      areaTypes: [],
    })
  }

  useEffect(() => {
    setValue(`options.${optionKey}.totalSqm`, totalArea)
  }, [totalArea, setValue, optionKey])

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <h2 className="text-xl font-semibold">Measurements</h2>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as ShapeType)}>
          <TabsList>
            <TabsTrigger value="rectangle">Rectangle</TabsTrigger>
            <TabsTrigger value="triangle">Triangle</TabsTrigger>
            <TabsTrigger value="trapezoid">Trapezoid</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button type="button" onClick={() => addShape(activeTab)} className="mt-2">
          + Add {activeTab}
        </Button>

        <div className="space-y-4">
          {typedFields.map((field, index) => {
            const prefix = `${fieldPath}.${index}`

            return (
              <div key={field.id} className="grid md:grid-cols-8 gap-3 items-end">
                <div className="col-span-2">
                  <Label>Label</Label>
                  <Input {...register(`${prefix}.label`)} placeholder="e.g. Driveway" />
                </div>

                <div className="col-span-2">
                  <Label>Area Type</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-left text-xs"
                        type="button"
                      >
                        {shapes?.[index]?.areaTypes?.length
                          ? shapes[index].areaTypes.join(', ')
                          : 'Select area types'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 space-y-2">
                      {AREA_TYPE_OPTIONS.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox
                            checked={shapes?.[index]?.areaTypes?.includes(option)}
                            onCheckedChange={() => {
                              const current = shapes?.[index]?.areaTypes || []
                              const updated = current.includes(option)
                                ? current.filter((v) => v !== option)
                                : [...current, option]
                              setValue(`${prefix}.areaTypes`, updated)
                            }}
                          />
                          <Label className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>

                {field.shape === 'rectangle' && (
                  <>
                    <div>
                      <Label>Length</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.0`)} />
                    </div>
                    <div>
                      <Label>Width</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.1`)} />
                    </div>
                  </>
                )}

                {field.shape === 'triangle' && (
                  <>
                    <div>
                      <Label>Base</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.0`)} />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.1`)} />
                    </div>
                  </>
                )}

                {field.shape === 'trapezoid' && (
                  <>
                    <div>
                      <Label>Top</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.0`)} />
                    </div>
                    <div>
                      <Label>Bottom</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.1`)} />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input type="number" step="any" {...register(`${prefix}.values.2`)} />
                    </div>
                  </>
                )}

                <div>
                  <Label>Area</Label>
                  <Input readOnly value={calculateArea(shapes?.[index]).toFixed(2)} />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )
          })}
        </div>

        <div className="text-right font-semibold text-lg">
          🔢 Total Area: {totalArea.toFixed(2)} sqm
        </div>

        <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
          <h3 className="font-medium">Summary by Area Type</h3>
          {areaByType.map(({ type, total }) => (
            <div key={type} className="flex justify-between">
              <span>{type}</span>
              <span>{total.toFixed(2)} sqm</span>
            </div>
          ))}
        </div>

        <input type="hidden" {...register(`options.${optionKey}.totalSqm`)} />
      </CardContent>
    </Card>
  )
}
