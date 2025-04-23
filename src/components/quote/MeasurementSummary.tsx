type Shape = {
  name: string
  area: number
  types?: string[]
}

type Props = {
  shapes: Shape[]
}

export default function MeasurementSummary({ shapes }: Props) {
  const totalArea = shapes.reduce((sum, shape) => sum + (shape.area || 0), 0)

  return (
    <div className="rounded-md border bg-muted/50 p-4 space-y-3">
      <h3 className="text-lg font-semibold">Area Measurements</h3>

      <ul className="text-sm space-y-1">
        {shapes.map((shape, i) => {
          const types = shape.types ?? []
          return (
            <li key={i}>
              • {shape.name} — {shape.area} m²
              {types.length > 0 && <> — Types: {types.join(', ')}</>}
            </li>
          )
        })}
      </ul>

      <div className="flex justify-end pt-2 mt-2 text-sm font-semibold border-t">
        Total Area: {totalArea} m²
      </div>
    </div>
  )
}




  