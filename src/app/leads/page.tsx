'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import NewLeadDialog from '@/components/leads/NewLeadDialog'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  'all',
  'inquired',
  'estimate started',
  'quoted',
  'accepted',
  'declined',
] as const

type LeadStatus = (typeof STATUS_OPTIONS)[number]

type Lead = {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  notes?: string
  services?: string[]
  address?: {
    street: string
    suburb: string
    postcode: string
    state: string
  }
  status: Exclude<LeadStatus, 'all'>
  createdAt?: { toDate: () => Date }
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus>('all')

  const fetchLeads = async () => {
    const ref = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(ref)
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Lead[]
    setLeads(data)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleDelete = async (leadId: string) => {
    await deleteDoc(doc(db, 'leads', leadId))
    toast.success('Lead deleted')
    fetchLeads()
  }

  const filtered = leads.filter(lead => {
    const name = `${lead.firstName} ${lead.lastName}`.toLowerCase()
    const matchesSearch = name.includes(search.toLowerCase()) || lead.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyToSms = () => {
    const unscheduledLeads = leads
      .filter(l => l.status === 'inquired')
      .map((l, i) => `${i + 1}. ${l.firstName} ${l.lastName} – ${l.address?.street}, ${l.address?.suburb} – ${l.phone || 'No phone'}`)
      .join('\n')

    const msg = `New Leads to Visit:\n${unscheduledLeads}\n\nSpray Coat and Seal Driveways`
    navigator.clipboard.writeText(msg)
    toast.success('Copied SMS text to clipboard')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leads</h1>
          <div className="flex gap-2">
            <Link href="/leads/map">
              <Button variant="outline">
                <MapPin className="w-4 h-4 mr-2" /> View Map
              </Button>
            </Link>
            <Button variant="outline" onClick={copyToSms}>
              Copy Leads to SMS
            </Button>
            <NewLeadDialog onCreated={fetchLeads} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={val => setStatusFilter(val as LeadStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const createdDate = lead.createdAt?.toDate?.()
              const ageDays = createdDate
                ? Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0

              let ageWarning = null
              if (lead.status === 'inquired') {
                if (ageDays >= 7) {
                  ageWarning = <span className="text-red-500 text-xs">❗ {ageDays} days</span>
                } else if (ageDays >= 4) {
                  ageWarning = <span className="text-yellow-600 text-xs">⚠ {ageDays} days</span>
                }
              }

              return (
                <tr key={lead.id} className="border-b hover:bg-muted transition">
                  <td className="p-3 whitespace-nowrap">
                    {createdDate ? formatDistanceToNow(createdDate, { addSuffix: true }) : '-'}
                    {ageWarning && <div>{ageWarning}</div>}
                  </td>
                  <td className="p-3 font-medium">{lead.firstName} {lead.lastName}</td>
                  <td className="p-3">{lead.phone || '-'}</td>
                  <td className="p-3">
                    {lead.address
                      ? `${lead.address.street}, ${lead.address.suburb}, ${lead.address.state} ${lead.address.postcode}`
                      : '-'}
                  </td>
                  <td className="p-3">
                    <Badge variant={
                      lead.status === 'accepted' ? 'default' :
                      lead.status === 'declined' ? 'destructive' :
                      'secondary'
                    }>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {lead.status === 'inquired' && (
                          <DropdownMenuItem onClick={() => router.push(`/estimates/new?leadId=${lead.id}`)}>
                            Create Estimate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-center text-muted-foreground">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}








