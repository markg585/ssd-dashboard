// app/estimates/page.tsx
import { getAllEstimates } from "@/lib/firestore";
import { EstimateList } from "@/components/estimate/list/EstimateList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EstimateListPage() {
  const estimates = await getAllEstimates();

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Job Estimates</h1>
        <Link href="/estimates/new">
          <Button>Add New Estimate</Button>
        </Link>
      </div>
      <EstimateList estimates={estimates} />
    </div>
  );
}
