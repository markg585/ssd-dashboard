import { getEstimateById } from '@/lib/firestore'
import { notFound } from 'next/navigation'
import PrintToolbar from '@/components/estimate/list/PrintToolbar'
import type { Estimate } from '@/types/estimate'

export default async function PrintEstimatePage({
  params,
}: {
  params: { estimateId: string }
}) {
  const estimate: Estimate | null = await getEstimateById(params.estimateId)
  if (!estimate) return notFound()

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 print:bg-white print:text-black">
      <PrintToolbar />
      {/* ...rest of page... */}
    </div>
  )
}
