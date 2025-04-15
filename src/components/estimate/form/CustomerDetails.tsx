'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useFormContext } from 'react-hook-form'
import type { FormData } from '@/types/estimate'

export default function CustomerDetails() {
  const { register } = useFormContext<FormData>()

  return (
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div>
          <Label>First Name</Label>
          <Input {...register('firstName')} />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input {...register('lastName')} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
        </div>
        <div>
          <Label>Email</Label>
          <Input {...register('email')} />
        </div>
        <div className="md:col-span-2">
          <Label>Job Details</Label>
          <Input {...register('details')} />
        </div>
      </CardContent>
    </Card>
  )
}

