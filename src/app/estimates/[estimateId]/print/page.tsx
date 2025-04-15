import { getEstimateById } from '@/lib/firestore'
import { notFound } from 'next/navigation'
import PrintToolbar from '@/components/estimate/list/PrintToolbar'

type PageProps = {
  params: {
    estimateId: string
  }
}

export default async function Page({ params }: PageProps) {
  const estimate = await getEstimateById(params.estimateId)

  if (!estimate) return notFound()

  const addr = estimate.jobsiteAddress || {}
  const jobsiteAddressText = [addr.street, addr.suburb, addr.state, addr.postcode]
    .filter(Boolean)
    .join(', ') || '—'

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
          <p className="text-sm text-muted-foreground">{estimate.createdAtFormatted}</p>
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">Customer</h3>
        <p><strong>Name:</strong> {estimate.firstName} {estimate.lastName}</p>
        <p><strong>Email:</strong> {estimate.customerEmail}</p>
        <p><strong>Phone:</strong> {estimate.phone}</p>
      </div>

      {/* JOBSITE ADDRESS */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">Jobsite Address</h3>
        <p>{jobsiteAddressText}</p>
        {estimate.details && (
          <p className="mt-2"><strong>Job Notes:</strong> {estimate.details}</p>
        )}
      </div>

      {/* More sections here if needed */}
    </div>
  )
}


