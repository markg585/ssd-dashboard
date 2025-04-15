'use client'

import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import type { FormData } from '@/types/estimate'

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function CustomerLookup() {
  const { setValue } = useFormContext<FormData>()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      const snap = await getDocs(collection(db, 'customers'))
      const list: Customer[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Customer, 'id'>),
      }))
      setCustomers(list)
    }

    fetchCustomers()
  }, [])

  const filtered = query.length === 0
    ? []
    : customers.filter((c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
      )

  const handleSelect = (customer: Customer) => {
    setSelected(customer)
    setQuery(`${customer.firstName} ${customer.lastName}`)
    setValue('firstName', customer.firstName)
    setValue('lastName', customer.lastName)
    setValue('email', customer.email)
    setValue('phone', customer.phone)
    setValue('customerId', customer.id) // ✅ no `as any` needed
  }

  return (
    <div className="space-y-2 mb-4">
      <Label>Find Existing Customer</Label>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSelected(null)
        }}
        placeholder="Search by name or email"
      />
      {filtered.length > 0 && !selected && (
        <div className="border rounded-md bg-white shadow-sm max-h-60 overflow-auto">
          {filtered.map((cust) => (
            <Button
              key={cust.id}
              variant="ghost"
              className="w-full justify-start text-left px-4 py-2 border-b text-sm"
              onClick={() => handleSelect(cust)}
            >
              {cust.firstName} {cust.lastName} — {cust.email}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}


