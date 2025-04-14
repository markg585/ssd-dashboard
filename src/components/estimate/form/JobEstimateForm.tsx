'use client'

import { useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

import CustomerDetails from '@/components/estimate/form/CustomerDetails'
import EquipmentSection from '@/components/estimate/form/EquipmentSection'
import MaterialsSection from '@/components/estimate/form/MaterialsSection'
import MeasurementsSection from '@/components/estimate/form/MeasurementsSection'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const optionSchema = z.object({
  totalSqm: z.coerce.number(),
  equipment: z.array(z.object({
    item: z.string(),
    category: z.enum(['Prep', 'Asphalt', 'Seal', 'General']),
    price: z.coerce.number().optional(),
    units: z.coerce.number(),
    hours: z.coerce.number(),
    days: z.coerce.number(),
  })),
  materials: z.array(z.object({
    item: z.string(),
    type: z.string(),
    sqm: z.coerce.number(),
    sprayRate: z.coerce.number(),
    price: z.coerce.number(),
  })),
  shapeEntries: z.array(z.object({
    id: z.string(),
    shape: z.enum(['rectangle', 'triangle', 'trapezoid']),
    label: z.string(),
    values: z.array(z.string()),
    areaTypes: z.array(z.string())
  }))
})

const formSchema = z.object({
  customerName: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email(),
  details: z.string().optional(),
  options: z.record(optionSchema)
})

type FormData = z.infer<typeof formSchema>

type ShapeEntry = FormData['options'][string]['shapeEntries'][number]

export default function JobEstimateForm() {
  const router = useRouter()
  const [options, setOptions] = useState(['Option A'])
  const [activeOption, setActiveOption] = useState('Option A')
  const [visitedTabs, setVisitedTabs] = useState(['Option A'])
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      address: '',
      phone: '',
      email: '',
      details: '',
      options: {
        'Option A': {
          totalSqm: 0,
          equipment: [],
          materials: [],
          shapeEntries: []
        }
      }
    }
  })

  const { getValues, setValue } = form

  const addNewOption = (optionName: string) => {
    setOptions(prev => [...prev, optionName])
    setActiveOption(optionName)
    setVisitedTabs(prev => [...prev, optionName])
    setValue(`options.${optionName}`, {
      totalSqm: 0,
      equipment: [],
      materials: [],
      shapeEntries: []
    })
  }

  const calculateArea = (entry: ShapeEntry): number => {
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

    const missingTabs = options.filter(opt => !visitedTabs.includes(opt))
    if (missingTabs.length > 0) {
      toast.error(`Please visit all options before saving.`)
      return
    }

    const emptyShapes = Object.entries(data.options).filter(
      ([, opt]) => opt.shapeEntries.length === 0
    )

    if (emptyShapes.length > 0) {
      toast.error(`Each option must include at least one measurement.`)
      return
    }

    setSaving(true)
    submittingRef.current = true

    try {
      const {
        customerName,
        phone,
        email,
        address,
        details,
        options
      } = data

      const customerId = email.toLowerCase().replace(/[@.]/g, '-')

      await setDoc(doc(db, 'customers', customerId), {
        name: customerName,
        phone,
        email,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      const processedOptions = Object.fromEntries(
        Object.entries(options).map(([key, option]) => {
          return [key, {
            ...option,
            shapeEntries: option.shapeEntries.map((entry) => ({
              ...entry,
              area: parseFloat(calculateArea(entry).toFixed(2)),
            })),
          }]
        })
      )

      await addDoc(collection(db, 'customers', customerId, 'jobsites'), {
        customerName,
        customerEmail: email,
        address,
        details,
        options: processedOptions,
        createdAt: serverTimestamp(),
      })

      toast.success('Estimate saved!')
      router.push('/thank-you')
    } catch (err) {
      console.error(err)
      toast.error('Save failed')
    } finally {
      setSaving(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <FormProvider {...form}>
        <form
          className="space-y-6"
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        >
          <CustomerDetails />

          <Tabs
            value={activeOption}
            onValueChange={(val) => {
              setActiveOption(val)
              setVisitedTabs(prev => prev.includes(val) ? prev : [...prev, val])
            }}
            className="space-y-4"
          >
            <TabsList className="gap-2">
              {options.map(opt => (
                <TabsTrigger key={opt} value={opt}>{opt}</TabsTrigger>
              ))}
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  const next = `Option ${String.fromCharCode(65 + options.length)}`
                  addNewOption(next)
                }}
              >
                + Add Option
              </Button>
            </TabsList>

            {options.map(opt => (
              <TabsContent key={opt} value={opt} className="space-y-6">
                <MeasurementsSection optionKey={opt} />
                <EquipmentSection fieldPrefix={`options.${opt}.equipment`} />
                <MaterialsSection />
              </TabsContent>
            ))}
          </Tabs>

          <Button
            type="button"
            disabled={saving}
            className="w-full"
            onClick={() => onSaveAll(getValues())}
          >
            {saving ? 'Saving...' : 'Save All Options'}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}
