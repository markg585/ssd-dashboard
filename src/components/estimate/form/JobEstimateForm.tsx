// /components/estimate/form/JobEstimateForm.tsx

'use client'

import { useRef, useState, useEffect } from 'react'
import {
  useForm,
  FormProvider,
  useFieldArray,
  useWatch,
} from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

import CustomerDetails from '@/components/estimate/form/CustomerDetails'
import CustomerLookup from '@/components/estimate/form/CustomerLookup'
import EquipmentSection from '@/components/estimate/form/EquipmentSection'
import MaterialsSection from '@/components/estimate/form/MaterialsSection'
import MeasurementsSection from '@/components/estimate/form/MeasurementsSection'
import JobsiteAddress from '@/components/estimate/form/JobsiteAddress'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const formSchema = z.object({
  customerId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string().email(),
  details: z.string().optional(),
  jobsiteAddress: z.object({
    street: z.string(),
    suburb: z.string(),
    postcode: z.string(),
    state: z.string(),
  }),
  leadId: z.string().optional(),
  options: z.array(z.object({
    key: z.string(),
    label: z.string(),
    totalSqm: z.coerce.number(),
    equipment: z.array(z.object({
      item: z.string(),
      category: z.enum(['Prep', 'Bitumen', 'Asphalt']),
      price: z.coerce.number().optional(),
      units: z.coerce.number(),
      hours: z.coerce.number(),
      days: z.coerce.number(),
    })),
    materials: z.array(z.object({
      item: z.string(),
      type: z.string(),
      sprayRate: z.coerce.number(),
    })),
    shapeEntries: z.array(z.object({
      id: z.string(),
      shape: z.enum(['rectangle', 'triangle', 'trapezoid']),
      label: z.string(),
      values: z.array(z.string()),
      areaTypes: z.array(z.string()),
    }))
  }))
})

export type FormData = z.infer<typeof formSchema>

export default function JobEstimateForm({ prefill }: { prefill?: Partial<FormData> }) {
  const router = useRouter()
  const [activeKey, setActiveKey] = useState('option-a')
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: undefined,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      details: '',
      jobsiteAddress: {
        street: '',
        suburb: '',
        postcode: '',
        state: '',
      },
      options: [
        {
          key: 'option-a',
          label: 'Option A',
          totalSqm: 0,
          equipment: [],
          materials: [],
          shapeEntries: [],
        },
      ],
    },
  })

  const { getValues, register, control, reset } = form
  const { fields, append, remove } = useFieldArray({ name: 'options', control })
  const optionValues = useWatch({ control, name: 'options' })

  useEffect(() => {
    if (prefill) {
      reset({
        ...getValues(),
        firstName: prefill.firstName ?? '',
        lastName: prefill.lastName ?? '',
        phone: prefill.phone ?? '',
        email: prefill.email ?? '',
        jobsiteAddress: prefill.jobsiteAddress ?? {
          street: '',
          suburb: '',
          postcode: '',
          state: '',
        },
        leadId: prefill.leadId,
      })
    }
  }, [prefill, reset, getValues])

  const addNewOption = () => {
    const charCode = 65 + fields.length
    const key = `option-${String.fromCharCode(charCode).toLowerCase()}`
    append({
      key,
      label: `Option ${String.fromCharCode(charCode)}`,
      totalSqm: 0,
      equipment: [],
      materials: [],
      shapeEntries: [],
    })
    setActiveKey(key)
  }

  const deleteOption = (index: number, key: string) => {
    remove(index)
    if (activeKey === key && fields.length > 1) {
      setActiveKey(fields[0].key)
    }
  }

  const calculateArea = (entry: { shape: string; values: string[] }): number => {
    const [a, b, c] = (entry.values ?? []).map((v) => parseFloat(v || '0'))
    switch (entry.shape) {
      case 'rectangle': return a * b
      case 'triangle': return 0.5 * a * b
      case 'trapezoid': return 0.5 * (a + b) * c
      default: return 0
    }
  }

  const onSaveAll = async (data: FormData) => {
    if (submittingRef.current) return

    const emptyShapes = data.options.filter(opt => opt.shapeEntries.length === 0)
    if (emptyShapes.length > 0) {
      toast.error(`Each option must include at least one measurement.`)
      return
    }

    setSaving(true)
    submittingRef.current = true

    try {
      const {
        customerId,
        firstName,
        lastName,
        phone,
        email,
        details,
        jobsiteAddress,
        options,
        leadId,
      } = data

      let finalCustomerId = customerId

      if (!finalCustomerId && email) {
        const existing = await getDocs(query(collection(db, 'customers'), where('email', '==', email)))
        if (!existing.empty) {
          finalCustomerId = existing.docs[0].id
        }
      }

      if (!finalCustomerId) {
        const customerRef = await addDoc(collection(db, 'customers'), {
          firstName,
          lastName,
          phone,
          email,
          createdAt: serverTimestamp(),
        })
        finalCustomerId = customerRef.id
      }

      const processedOptions = options.map(option => ({
        ...option,
        shapeEntries: option.shapeEntries.map((entry) => ({
          ...entry,
          area: parseFloat(calculateArea(entry).toFixed(2)),
        })),
      }))

      await addDoc(collection(db, 'customers', finalCustomerId, 'jobsites'), {
        customerId: finalCustomerId,
        firstName,
        lastName,
        customerEmail: email,
        phone,
        details,
        jobsiteAddress,
        options: processedOptions,
        createdAt: serverTimestamp(),
        leadId: leadId ?? null,
      })

      if (leadId) {
        await updateDoc(doc(db, 'leads', leadId), {
          status: 'estimate completed',
        })
      }

      toast.success('Estimate saved!')
      router.push('/estimates')
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 max-w-4xl mx-auto sm:px-6">
      <FormProvider {...form}>
        <form
          className="space-y-6"
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        >
          <CustomerLookup />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Customer Info</h3>
              <CustomerDetails />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Jobsite Address</h3>
              <JobsiteAddress />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-semibold">Estimate Options</h3>

              <Tabs
                value={activeKey}
                onValueChange={(val) => setActiveKey(val)}
                className="space-y-4"
              >
                <TabsList className="flex flex-wrap gap-2 overflow-x-auto max-w-full">
                  {fields.map((field, index) => (
                    <div key={field.key} className="relative">
                      <TabsTrigger value={field.key} className="pr-6 pl-3">
                        <span>{optionValues?.[index]?.label || field.label}</span>
                      </TabsTrigger>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteOption(index, field.key)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </TabsList>

                <div className="mt-2">
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={addNewOption}
                  >
                    + Add Option
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <TabsContent key={field.key} value={field.key} className="space-y-6">
                    <Input
                      {...register(`options.${index}.label`)}
                      autoComplete="off"
                      placeholder="Label (e.g. Front Driveway)"
                      className="max-w-sm"
                    />
                    <MeasurementsSection optionIndex={index} />
                    <EquipmentSection fieldPrefix={`options.${index}.equipment`} />
                    <MaterialsSection optionIndex={index} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Button
            type="button"
            disabled={saving}
            className="w-full sm:w-auto"
            onClick={() => onSaveAll(getValues())}
          >
            {saving ? 'Saving...' : 'Save All Options'}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}




