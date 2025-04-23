"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Trash2 } from "lucide-react"

export const EstimateAdditionalItems = () => {
  const { control, register } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalItems"
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Additional Items</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ description: "", quantity: "", unitPrice: "" })
          }
        >
          + Add Item
        </Button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-12 gap-2 items-end border p-4 rounded-xl"
        >
          <div className="col-span-6">
            <Label>Description</Label>
            <Input
              {...register(`additionalItems.${index}.description`)}
              placeholder="e.g. Extra gravel"
            />
          </div>
          <div className="col-span-2">
            <Label>Qty</Label>
            <Input
              type="number"
              {...register(`additionalItems.${index}.quantity`)}
            />
          </div>
          <div className="col-span-3">
            <Label>Unit Price</Label>
            <Input
              type="number"
              step="0.01"
              {...register(`additionalItems.${index}.unitPrice`)}
            />
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
