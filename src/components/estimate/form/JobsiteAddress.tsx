'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function JobsiteAddress() {
  const { register } = useFormContext<{
    jobsiteAddress: {
      street: string
      suburb: string
      postcode: string
      state: string
    }
  }>()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label>Street</Label>
        <Input {...register('jobsiteAddress.street')} />
      </div>
      <div>
        <Label>Suburb</Label>
        <Input {...register('jobsiteAddress.suburb')} />
      </div>
      <div>
        <Label>Postcode</Label>
        <Input {...register('jobsiteAddress.postcode')} />
      </div>
      <div>
        <Label>State</Label>
        <Input {...register('jobsiteAddress.state')} />
      </div>
    </div>
  )
}
