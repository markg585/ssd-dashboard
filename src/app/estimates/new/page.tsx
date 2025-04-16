// /app/estimates/new/page.tsx

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import JobEstimateForm from '@/components/estimate/form/JobEstimateForm'
import type { FormData } from '@/components/estimate/form/JobEstimateForm'
import { toast } from 'sonner'

export default function NewEstimatePage() {
  const params = useSearchParams()
  const router = useRouter()
  const leadId = params.get('leadId')
  const [prefill, setPrefill] = useState<Partial<FormData> | null>(null)

  useEffect(() => {
    if (!leadId) return

    const fetchLead = async () => {
      const ref = doc(db, 'leads', leadId!)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const lead = snap.data()

        if (lead.status === 'estimate completed') {
          toast.error('Estimate already created for this lead.')
          router.push('/leads')
          return
        }

        // Update lead to 'estimate started'
        await updateDoc(ref, { status: 'estimate started' })

        setPrefill({
          firstName: lead.firstName || '',
          lastName: lead.lastName || '',
          email: lead.email || '',
          phone: lead.phone || '',
          jobsiteAddress: lead.address || {
            street: '',
            suburb: '',
            postcode: '',
            state: '',
          },
          leadId,
        })
      }
    }

    fetchLead()
  }, [leadId, router])

  return <JobEstimateForm prefill={prefill ?? undefined} />
}
