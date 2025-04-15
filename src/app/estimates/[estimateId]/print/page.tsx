import { getEstimateById } from '@/lib/firestore'
import { notFound } from 'next/navigation'
import PrintToolbar from '@/components/estimate/list/PrintToolbar'

// --- Types ---
type EquipmentItem = {
  item: string
  units: number
  hours: number
  days: number
  category: string
}

type MaterialItem = {
  item: string
  type: string
  sprayRate: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page(props: any) {
  const estimateId = props.params?.estimateId
  const estimate = await getEstimateById(estimateId)
  if (!estimate) return notFound()

  const typedEstimate = estimate as NonNullable<typeof estimate>

  return (
    <div className="print-only max-w-3xl mx-auto p-6 space-y-8">
      <PrintToolbar />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">SCSD</h1>
          <p className="text-sm text-muted-foreground">Surfacing & Civil Driveways</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Job Estimate</h2>
          <p className="text-sm text-muted-foreground">{typedEstimate.createdAtFormatted}</p>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">Customer</h3>
        <p><strong>Name:</strong> {typedEstimate.customerName}</p>
        <p><strong>Email:</strong> {typedEstimate.customerEmail}</p>
        <p><strong>Address:</strong> {typedEstimate.address}</p>
        {typedEstimate.details && <p><strong>Notes:</strong> {typedEstimate.details}</p>}
      </div>

      {/* ESTIMATE OPTIONS */}
      {Array.isArray(typedEstimate.options) && typedEstimate.options.map((opt, index: number) => {
        const areaByType: Record<string, number> = {}

        opt.shapeEntries?.forEach((shape: { area?: number; areaTypes?: string[] }) => {
          const area = shape.area || 0
          shape.areaTypes?.forEach((type: string) => {
            areaByType[type] = (areaByType[type] || 0) + area
          })
        })

        const usedTypes = Object.entries(areaByType).filter(([, total]) => total > 0)

        return (
          <div key={opt.key || index} className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-lg">{opt.label}</h4>

            {/* Area Type Breakdown */}
            <div className="text-sm space-y-1">
              <h5 className="font-medium">Area Type Breakdown</h5>
              <ul className="pl-4 list-disc">
                {usedTypes.map(([type, total]: [string, number]) => (
                  <li key={type}>
                    <strong>{type}</strong>: {total.toFixed(2)} sqm
                  </li>
                ))}
              </ul>
            </div>

            {/* Total area */}
            <p className="text-sm">
              <strong>Total Area:</strong> {opt.totalSqm?.toFixed(2)} sqm
            </p>

            {/* Equipment Grouping */}
            {opt.equipment?.length > 0 && (
              <div className="mt-2 space-y-4">
                <h5 className="font-medium text-sm">Equipment & Labour</h5>

                {['Prep', 'Bitumen', 'Asphalt'].map((category: string) => {
                  const items = opt.equipment.filter((eq: EquipmentItem) => eq.category === category)
                  if (items.length === 0) return null

                  return (
                    <div key={category} className="space-y-1">
                      <p className="text-sm font-semibold">{category}</p>
                      <div className="border text-sm rounded-md overflow-hidden">
                        <div className="grid grid-cols-5 bg-muted px-3 py-2 font-medium text-xs uppercase text-muted-foreground">
                          <div>Item</div>
                          <div>Units</div>
                          <div>Hours</div>
                          <div>Days</div>
                          <div>Total Hrs</div>
                        </div>
                        {items.map((eq: EquipmentItem, idx: number) => {
                          const totalHrs = Number(eq.units || 0) * Number(eq.hours || 0) * Number(eq.days || 0)

                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-5 px-3 py-2 border-t text-xs"
                            >
                              <div>{eq.item || '-'}</div>
                              <div>{eq.units || '-'}</div>
                              <div>{eq.hours || '-'}</div>
                              <div>{eq.days || '-'}</div>
                              <div>{totalHrs || '-'}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Materials */}
            {opt.materials?.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="font-medium text-sm">Materials</h5>
                <div className="border text-sm rounded-md overflow-hidden">
                  <div className="grid grid-cols-3 bg-muted px-3 py-2 font-medium text-xs uppercase text-muted-foreground">
                    <div>Item</div>
                    <div>Type</div>
                    <div>Spray Rate</div>
                  </div>
                  {opt.materials.map((mat: MaterialItem, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 px-3 py-2 border-t text-xs"
                    >
                      <div>{mat.item || '-'}</div>
                      <div>{mat.type || '-'}</div>
                      <div>{mat.sprayRate || '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* FOOTER */}
      <div className="pt-6 mt-6 text-sm text-muted-foreground border-t">
        <p>This estimate is valid for 30 days. Final pricing may vary based on site inspection and agreed scope.</p>
        <p className="mt-6">Signature: ____________________________</p>
      </div>
    </div>
  )
}

