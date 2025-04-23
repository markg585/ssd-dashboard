// /app/quotes/new-from-estimate/[estimateId]/page.tsx

import { getEstimateById } from '@/lib/firestore/estimates'
import QuoteForm from '@/components/quote/QuoteForm'

export default async function Page({
  params,
}: {
  params: { estimateId: string }
}) {
  const estimate = await getEstimateById(params.estimateId)

  if (!estimate) {
    return <div className="p-6 text-red-600">Estimate not found</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Quote from Estimate</h1>
      <QuoteForm initialEstimate={estimate} />
    </div>
  )
}

