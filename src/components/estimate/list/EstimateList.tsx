'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Printer, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteEstimateById } from '@/lib/firestore'
import type { Estimate } from '@/types/estimate'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

type Props = {
  estimates: Estimate[]
}

export function EstimateList({ estimates }: Props) {
  const [data, setData] = useState<Estimate[]>(estimates)
  const [search, setSearch] = useState('')
  const [customerFilter, setCustomerFilter] = useState<string | null>('__all__')

  const handleDelete = async (refPath: string) => {
    try {
      await deleteEstimateById(refPath)
      setData((prev) => prev.filter((est) => est.ref !== refPath))
      toast.success('Estimate deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const customers = useMemo(() => {
    return Array.from(
      new Set(estimates.map((e) => `${e.firstName} ${e.lastName}`))
    ).sort()
  }, [estimates])

  const filtered = useMemo(() => {
    return data
      .filter((est) => {
        const fullName = `${est.firstName} ${est.lastName}`
        const addressText = est.jobsiteAddress
          ? `${est.jobsiteAddress.street} ${est.jobsiteAddress.suburb} ${est.jobsiteAddress.state} ${est.jobsiteAddress.postcode}`
          : ''

        const matchSearch =
          fullName.toLowerCase().includes(search.toLowerCase()) ||
          est.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
          addressText.toLowerCase().includes(search.toLowerCase())

        const matchCustomer =
          !customerFilter || customerFilter === '__all__'
            ? true
            : fullName === customerFilter

        return matchSearch && matchCustomer
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [data, search, customerFilter])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search estimates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select onValueChange={(val) => setCustomerFilter(val)} defaultValue="__all__">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Customers</SelectItem>
            {customers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border rounded-xl shadow-sm">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((est, idx) => {
              const fullName = `${est.firstName} ${est.lastName}`
              const address = est.jobsiteAddress
                ? `${est.jobsiteAddress.street}, ${est.jobsiteAddress.suburb} ${est.jobsiteAddress.state} ${est.jobsiteAddress.postcode}`
                : '—'
              return (
                <TableRow
                  key={est.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/50'}
                >
                  <TableCell>{est.createdAtFormatted}</TableCell>
                  <TableCell className="font-medium">{fullName}</TableCell>
                  <TableCell>{address}</TableCell>
                  <TableCell>{est.customerEmail || '—'}</TableCell>
                  <TableCell>{est.phone || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
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
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  No estimates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

