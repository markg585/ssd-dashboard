export const dynamic = 'force-dynamic' // 💥 Always fetch fresh data

import { getAllEstimates } from "@/lib/firestore"
import { EstimateList } from "@/components/estimate/list/EstimateList"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EstimateListPage() {
  const estimates = await getAllEstimates()

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="text-2xl font-semibold">Job Estimates</h1>
        <Link href="/estimates/new">
          <Button>Add New Estimate</Button>
        </Link>
      </div>

      <EstimateList estimates={estimates} />
    </div>
  )
}

