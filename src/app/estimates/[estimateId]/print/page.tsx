import { getEstimateById } from '@/lib/firestore'
import { notFound } from 'next/navigation'
import PrintToolbar from '@/components/estimate/list/PrintToolbar'

export default async function Page(props: any) {
  const estimateId = props.params.estimateId
  const estimate = await getEstimateById(estimateId)
  if (!estimate) return notFound()

  const addr = estimate.jobsiteAddress || {}
  const jobsiteAddressText = [addr.street, addr.suburb, addr.state, addr.postcode]
    .filter(Boolean)
    .join(', ') || '—'

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-white text-black print:p-6 print:max-w-full print:bg-white print:text-black">
      {/* Toolbar and Title – visible only on screen */}
      <div className="print:hidden mb-4 space-y-2">
        <h1 className="text-2xl font-bold">Estimate Preview</h1>
        <PrintToolbar />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">SCSD</h1>
          <p className="text-sm text-muted-foreground">Surfacing & Civil Driveways</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Job Estimate</h2>
          <p className="text-sm text-muted-foreground">{estimate.createdAtFormatted}</p>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div className="border p-4 rounded-md bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Customer</h3>
        <p><strong>Name:</strong> {estimate.firstName} {estimate.lastName}</p>
        <p><strong>Email:</strong> {estimate.customerEmail}</p>
        <p><strong>Phone:</strong> {estimate.phone}</p>
      </div>

      {/* JOBSITE ADDRESS */}
      <div className="border p-4 rounded-md bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Jobsite Address</h3>
        <p>{jobsiteAddressText}</p>
        {estimate.details && (
          <p className="mt-2"><strong>Job Notes:</strong> {estimate.details}</p>
        )}
      </div>

      {/* ESTIMATE OPTIONS */}
      {estimate.options?.map((opt, idx) => (
        <div key={idx} className="border p-6 rounded-md space-y-6 bg-white shadow-sm">
          <h3 className="font-semibold text-lg">Quote Option {idx + 1}: {opt.label}</h3>
          <p className="text-sm"><strong>Total Area:</strong> {opt.totalSqm} m²</p>

          {/* AREA MEASUREMENTS */}
          {opt.shapeEntries?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-1">Area Measurements</h4>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {opt.shapeEntries.map((s, i) => (
                  <li key={i}>
                    {s.label} – {s.area} m²
                    {s.areaTypes?.length > 0 && (
                      <> — Type{s.areaTypes.length > 1 ? 's' : ''}: {s.areaTypes.join(', ')}</>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* EQUIPMENT & LABOUR */}
          {opt.equipment?.length > 0 && (
            <div className="space-y-4 mt-6">
              <h4 className="text-lg font-semibold">Equipment & Labour</h4>
              {['Prep', 'Bitumen', 'Asphalt'].map((category) => {
                const items = opt.equipment.filter(e => e.category === category)
                if (items.length === 0) return null

                return (
                  <div key={category} className="space-y-2">
                    <h5 className="text-base font-semibold">{category}</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-300 table-fixed">
                        <colgroup>
                          <col className="w-[50%]" />
                          <col className="w-[16.66%]" />
                          <col className="w-[16.66%]" />
                          <col className="w-[16.66%]" />
                        </colgroup>
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left px-3 py-2 border">Item</th>
                            <th className="text-left px-3 py-2 border">Units</th>
                            <th className="text-left px-3 py-2 border">Hours</th>
                            <th className="text-left px-3 py-2 border">Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((e, i) => (
                            <tr key={i} className="even:bg-gray-50">
                              <td className="px-3 py-2 border">{e.item}</td>
                              <td className="px-3 py-2 border">{e.units}</td>
                              <td className="px-3 py-2 border">{e.hours}</td>
                              <td className="px-3 py-2 border">{e.days}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* MATERIALS */}
          {opt.materials?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold">Materials</h4>
              <table className="w-full text-sm border border-gray-300 mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2 border">Item</th>
                    <th className="text-left px-3 py-2 border">Type</th>
                    <th className="text-left px-3 py-2 border">Spray Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {opt.materials.map((m, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-3 py-2 border">{m.item}</td>
                      <td className="px-3 py-2 border">{m.type}</td>
                      <td className="px-3 py-2 border">{m.sprayRate} L/m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* ADDITIONAL ITEMS */}
      {Array.isArray(estimate.additionalItems) && estimate.additionalItems.length > 0 && (
        <div className="border p-6 rounded-md space-y-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold">Additional Items</h3>
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2 border">Description</th>
                <th className="text-left px-3 py-2 border">Qty</th>
                <th className="text-left px-3 py-2 border">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {(estimate.additionalItems ?? []).map((item, i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="px-3 py-2 border">{item.description || '—'}</td>
                  <td className="px-3 py-2 border">{item.quantity ?? '—'}</td>
                  <td className="px-3 py-2 border">
                    {item.unitPrice !== undefined ? `$${item.unitPrice}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JOB NOTES */}
      {estimate.jobNotes && (
        <div className="border p-6 rounded-md bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Job Notes</h3>
          <p className="text-sm whitespace-pre-line">{estimate.jobNotes}</p>
        </div>
      )}
    </div>
  )
}









