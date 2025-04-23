'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useFormContext } from 'react-hook-form'

export default function EstimateJobNotes() {
  const { register } = useFormContext()

  return (
    <div className="space-y-2">
      <Label htmlFor="jobNotes">Job Notes</Label>
      <Textarea
        id="jobNotes"
        {...register("jobNotes")}
        placeholder="Any specific prep, access issues, machinery details, etc."
        rows={4}
      />
    </div>
  )
}
