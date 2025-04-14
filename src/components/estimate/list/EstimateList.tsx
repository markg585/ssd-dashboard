'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteEstimateById } from '@/lib/firestore'
import type { Estimate, EstimateOption } from '@/types/estimate'

type Props = {
  estimates: Estimate[]
}

export function EstimateList({ estimates }: Props) {
  const [data, setData] = useState<Estimate[]>(estimates)

  const handleDelete = async (refPath: string) => {
    try {
      await deleteEstimateById(refPath)
      setData((prev) => prev.filter((est) => est.ref !== refPath))
      toast.success('Estimate deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Job Estimates</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((est) => (
            <TableRow key={est.id}>
              <TableCell>
                <div className="font-medium">{est.customerName || '—'}</div>
                <div className="text-sm text-muted-foreground">
                  {est.customerEmail || '—'}
                </div>
              </TableCell>
              <TableCell>{est.address || '—'}</TableCell>
              <TableCell>{est.createdAtFormatted}</TableCell>
              <TableCell>{getUsageSummary(est.options)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/estimates/${est.id}/review`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </Link>
                  <Link href={`/estimates/${est.id}/print`}>
                    <Button size="sm" variant="secondary">
                      <Printer className="w-4 h-4 mr-1" /> Print
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(est.ref)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function getUsageSummary(options: Record<string, EstimateOption>): string {
  const usageTotals: Record<string, number> = {}

  Object.values(options).forEach((opt) => {
    opt?.shapeEntries?.forEach((shape) => {
      shape.areaTypes?.forEach((type) => {
        usageTotals[type] = (usageTotals[type] || 0) + (shape.area || 0)
      })
    })
  })

  if (Object.keys(usageTotals).length === 0) return '—'

  return Object.entries(usageTotals)
    .map(([type, total]) => `${type}: ${total.toFixed(1)} sqm`)
    .join(' | ')
}
