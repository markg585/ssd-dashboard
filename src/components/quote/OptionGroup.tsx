'use client'

import { QuoteItem } from '@/types/quote'
import GroupedEquipment from './GroupedEquipment'
import MaterialList from './MaterialList'
import AdditionalItems from './AdditionalItems'
import NotesSection from './NotesSection'
import MeasurementSummary from './MeasurementSummary'
import type { Estimate } from '@/types/estimate'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type OptionGroupProps = {
  index: number
  option: {
    label: string
    equipment: QuoteItem[]
    materials: QuoteItem[]
    additionalItems: QuoteItem[]
    shapes?: {
      name: string
      area: number
      types: string[]
    }[]
    notes?: string
  }
  allItems: QuoteItem[]
  initialEstimate: Estimate
  materialMap: Map<string, any>
}

export default function OptionGroup({
  index,
  option,
  allItems,
  initialEstimate,
  materialMap,
}: OptionGroupProps) {
  const { label, equipment, materials, additionalItems, shapes, notes } = option

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Option {index + 1}: {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Measurements */}
        <MeasurementSummary shapes={shapes || []} />

        {/* Equipment */}
        {equipment.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">Equipment</h3>
            <GroupedEquipment equipmentItems={equipment} allItems={allItems} />
          </div>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">Materials</h3>
            <MaterialList
              materials={materials}
              allItems={allItems}
              initialEstimate={initialEstimate}
              materialMap={materialMap}
            />
          </div>
        )}

        {/* Additional Items */}
        {additionalItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">Additional Items</h3>
            <AdditionalItems items={additionalItems} allItems={allItems} />
          </div>
        )}

        {/* Notes */}
        {notes && notes.trim().length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">Notes</h3>
            <NotesSection notes={notes} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}





