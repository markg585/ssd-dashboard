'use client'

import { useEffect, useState } from 'react'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

// ✅ Use this if you've defined it in estimate.ts
export type EquipmentCategory = 'Prep' | 'Bitumen' | 'Asphalt'

type EquipmentItem = {
  name: string
  price: number
  category: EquipmentCategory
}

type Equipment = {
  item: string
  category: EquipmentCategory
  units: number | string
  hours: number | string
  days: number | string
}

type Props = {
  fieldPrefix: string
}

export default function EquipmentSection({ fieldPrefix }: Props) {
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentItem[]>([])

  const { control, register, setValue } = useFormContext<{
    [key: string]: Equipment[]
  }>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPrefix,
  })

  const equipmentValues = useWatch({ control, name: fieldPrefix })

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'equipmentItems'))
        const items: EquipmentItem[] = []

        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          if (
            data &&
            typeof data.name === 'string' &&
            typeof data.price === 'number'
          ) {
            items.push({
              name: data.name,
              price: data.price,
              category: typeof data.category === 'string' ? data.category : 'Prep',
            } as EquipmentItem)
          }
        })

        setEquipmentOptions(items)
      } catch (err) {
        console.error('Error fetching equipmentItems:', err)
      }
    }

    fetchEquipment()
  }, [])

  return (
    <Card>
      <CardContent className="space-y-4 pt-6 overflow-x-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Equipment & Labour</h2>
          <Button
            type="button"
            onClick={() =>
              append({
                item: '',
                category: 'Prep',
                units: '',
                hours: '',
                days: '',
              })
            }
          >
            + Add Equipment
          </Button>
        </div>

        {/* HEADER GRID */}
        <div className="grid grid-cols-[250px_140px_80px_80px_80px_100px_40px] gap-2 text-sm font-medium text-muted-foreground">
          <div>Item</div>
          <div>Category</div>
          <div>Units</div>
          <div>Hours</div>
          <div>Days</div>
          <div>Total Hrs</div>
          <div></div>
        </div>

        {fields.map((field, index) => {
          const row = equipmentValues?.[index] || {}
          const totalHrs =
            Number(row.units || 0) * Number(row.hours || 0) * Number(row.days || 0)

          return (
            <div
              key={field.id}
              className="grid grid-cols-[250px_140px_80px_80px_80px_100px_40px] gap-2 items-center"
            >
              {/* ITEM COMBOBOX */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full min-w-[220px] justify-start text-left truncate"
                  >
                    {row.item || 'Select item'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search items..." />
                    <CommandEmpty>No match found.</CommandEmpty>
                    <CommandGroup>
                      {equipmentOptions
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                          <CommandItem
                            key={item.name}
                            value={item.name}
                            onSelect={() =>
                              setValue(`${fieldPrefix}.${index}.item`, item.name)
                            }
                          >
                            {item.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* ✅ CATEGORY SELECT — fixed */}
              <Select
                value={row.category || ''}
                onValueChange={(value: EquipmentCategory) =>
                  setValue(`${fieldPrefix}.${index}.category`, value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prep">Prep</SelectItem>
                  <SelectItem value="Bitumen">Bitumen</SelectItem>
                  <SelectItem value="Asphalt">Asphalt</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                {...register(`${fieldPrefix}.${index}.units`, { valueAsNumber: true })}
              />
              <Input
                type="number"
                {...register(`${fieldPrefix}.${index}.hours`, { valueAsNumber: true })}
              />
              <Input
                type="number"
                {...register(`${fieldPrefix}.${index}.days`, { valueAsNumber: true })}
              />

              <div className="text-sm text-center">{totalHrs || '-'}</div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
