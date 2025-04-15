'use client'

import { useRef, useState } from 'react'
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const optionSchema = z.object({
  key: z.string(),
  label: z.string(),
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
  options: z.array(optionSchema)
})

export type FormData = z.infer<typeof formSchema>

export default function JobEstimateForm() {
  const router = useRouter()
  const [activeKey, setActiveKey] = useState('option-a')
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
      options: [
        {
          key: 'option-a',
          label: 'Option A',
          totalSqm: 0,
          equipment: [],
          materials: [],
          shapeEntries: []
        }
      ]
    }
  })

  const { getValues, setValue, register, control } = form
  const { fields, append, remove } = useFieldArray({ name: 'options', control })
  const optionValues = useWatch({ control, name: 'options' })

  const addNewOption = () => {
    const charCode = 65 + fields.length
    const key = `option-${String.fromCharCode(charCode).toLowerCase()}`
    append({
      key,
      label: `Option ${String.fromCharCode(charCode)}`,
      totalSqm: 0,
      equipment: [],
      materials: [],
      shapeEntries: []
    })
    setActiveKey(key)
  }

  const deleteOption = (index: number, key: string) => {
    remove(index)
    if (activeKey === key && fields.length > 1) {
      setActiveKey(fields[0].key)
    }
  }

  const calculateArea = (entry: { shape: string, values: string[] }): number => {
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

      const processedOptions = options.map(option => ({
        ...option,
        shapeEntries: option.shapeEntries.map((entry) => ({
          ...entry,
          area: parseFloat(calculateArea(entry).toFixed(2))
        }))
      }))

      await addDoc(collection(db, 'customers', customerId, 'jobsites'), {
        customerName,
        customerEmail: email,
        phone,
        address,
        details,
        options: processedOptions,
        createdAt: serverTimestamp(),
      })

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
          <CustomerDetails />

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