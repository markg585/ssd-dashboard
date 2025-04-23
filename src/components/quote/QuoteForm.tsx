'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { collection, getDocs } from 'firebase/firestore'
import { toast } from 'sonner'
import OptionGroup from './OptionGroup'
import QuoteSummary from './QuoteSummary'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { QuotePdf } from '@/lib/pdf/generateQuotePdf'
import { db } from '@/lib/firebase'
import { saveQuoteToFirestore } from '@/lib/firestore/saveQuote'
import { calculateTotals } from '@/utils/calculateTotals'
import type { Estimate } from '@/types/estimate'
import type { QuoteItem } from '@/types/quote'
import { nanoid } from 'nanoid'

const quoteSchema = z.object({
  markupPercentage: z.coerce.number().min(0).max(100),
  items: z.record(
    z.object({
      unit: z.number().optional(),
      hours: z.number().optional(),
      days: z.number().optional(),
      unitPrice: z.number(),
      quantity: z.number().optional(),
      sqm: z.number().optional(),
      sprayRate: z.number().optional(),
      total: z.number().optional(),
    })
  ),
})

export type QuoteFormData = z.infer<typeof quoteSchema>

export default function QuoteForm({ initialEstimate }: { initialEstimate: Estimate }) {
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      markupPercentage: 20,
      items: {},
    },
  })

  const { control, reset, watch, handleSubmit } = form
  const itemsMap = watch('items')
  const markupPercentage = watch('markupPercentage')

  const [includedOptions, setIncludedOptions] = useState<Record<string, boolean>>({})
  const [materialMap, setMaterialMap] = useState<Map<string, any>>(new Map())
  const [ready, setReady] = useState(false)
  const [items, setItems] = useState<QuoteItem[]>([])

  const buildItemsFromEstimate = async (estimate: Estimate): Promise<QuoteItem[]> => {
    const [materialsSnap, equipmentSnap] = await Promise.all([
      getDocs(collection(db, 'materials')),
      getDocs(collection(db, 'equipmentItems')),
    ])

    const materialMapLocal = new Map<string, any>()
    const equipmentMap = new Map<string, any>()

    materialsSnap.forEach((doc) => {
      const d = doc.data()
      const key = d.item?.trim().toLowerCase()
      if (key) materialMapLocal.set(key, d)
    })
    setMaterialMap(materialMapLocal)

    equipmentSnap.forEach((doc) => {
      const d = doc.data()
      const key = d.name?.trim().toLowerCase()
      if (key) equipmentMap.set(key, d)
    })

    const quoteItems: QuoteItem[] = []

    for (const opt of estimate.options) {
      for (const m of opt.materials) {
        const key = m.item?.toLowerCase().trim()
        const mat = materialMapLocal.get(key)
        if (!mat) continue

        const sprayRate = parseFloat(m.sprayRate?.toString() || '1')
        const unitPrice = Number(mat.unitPrice || 0)

        quoteItems.push({
          id: nanoid(),
          optionLabel: opt.label,
          label: m.item,
          type: 'material',
          description: `${m.type} | ${mat.measurement || ''}`,
          quantity: 0,
          unitPrice,
          unitCost: unitPrice,
          total: 0,
          sqm: 0,
          sprayRate,
        })
      }

      for (const e of opt.equipment) {
        const key = e.item?.toLowerCase().trim()
        const eq = equipmentMap.get(key)
        const unitPrice = Number(eq?.unitPrice ?? eq?.price ?? 0)

        const quantity = (e.units || 0) * (e.hours || 0) * (e.days || 0)

        quoteItems.push({
          id: nanoid(),
          optionLabel: opt.label,
          label: e.item,
          type: 'equipment',
          category: e.category,
          description: `${e.units} units × ${e.hours} hrs × ${e.days} days`,
          unit: Number(e.units),
          hours: e.hours,
          days: e.days,
          unitPrice,
          unitCost: unitPrice,
          quantity,
          total: quantity * unitPrice,
        })
      }

      for (const add of estimate.additionalItems || []) {
        const quantity = Number(add.quantity || 0)
        const unitPrice = Number(add.unitPrice || 0)

        quoteItems.push({
          id: nanoid(),
          optionLabel: opt.label,
          label: add.description || 'Other',
          type: 'other',
          description: 'Additional',
          quantity,
          unitPrice,
          unitCost: 0,
          total: quantity * unitPrice,
        })
      }
    }

    return quoteItems
  }

  useEffect(() => {
    if (!initialEstimate) return

    buildItemsFromEstimate(initialEstimate).then((rawItems) => {
      const withIds = rawItems.map((item) => ({
        ...item,
        id: item.id ?? nanoid(),
      }))

      const formItems = Object.fromEntries(
        withIds.map((item) => [
          item.id,
          {
            unit: Number(item.unit ?? 0),
            hours: Number(item.hours ?? 0),
            days: Number(item.days ?? 0),
            unitPrice: Number(item.unitPrice ?? 0),
            quantity: Number(item.quantity ?? 0),
            sqm: Number(item.sqm ?? 0),
            sprayRate: Number(item.sprayRate ?? 1),
          },
        ])
      )

      reset({
        markupPercentage: 20,
        items: formItems,
      })

      const optionLabels = Array.from(
        new Set(withIds.map((i) => i.optionLabel).filter(Boolean))
      ) as string[]

      const initialIncluded: Record<string, boolean> = optionLabels.reduce((acc, label) => {
        acc[label] = true
        return acc
      }, {} as Record<string, boolean>)

      setIncludedOptions(initialIncluded)
      setItems(withIds)
      setReady(true)
    })
  }, [initialEstimate, reset])

  const onSubmit = async (formData: QuoteFormData) => {
    const itemsMap = formData.items
    const markupPercentage = formData.markupPercentage

    const totals = calculateTotals({
      items,
      itemsMap,
      includedOptions,
      markupPercentage,
    })

    const quoteData = {
      customerName: `${initialEstimate.firstName} ${initialEstimate.lastName}`,
      customerEmail: initialEstimate.customerEmail,
      phone: initialEstimate.phone,
      jobsite: initialEstimate.jobsiteAddress,
      includedOptions: Object.entries(includedOptions)
        .filter(([label, v]) => label && v)
        .map(([label]) => label),
      markupPercentage,
      items,
      totals,
    }

    try {
      const quoteId = await saveQuoteToFirestore(quoteData)
      toast.success('Quote saved successfully!')
      console.log('✅ Quote saved with ID:', quoteId)
    } catch (err) {
      console.error('❌ Save failed', err)
      toast.error('Failed to save quote.')
    }
  }

  const groupedByOption = items.reduce((acc, item) => {
    if (!item.optionLabel) return acc
    const key = item.optionLabel
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {} as Record<string, QuoteItem[]>)

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold mb-4">New Quote from Estimate</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <span className="font-medium text-foreground">Customer:</span>{' '}
                {initialEstimate?.firstName} {initialEstimate?.lastName}
              </div>
              <div>
                <span className="font-medium text-foreground">Phone:</span>{' '}
                {initialEstimate?.phone || 'N/A'}
              </div>
              <div>
                <span className="font-medium text-foreground">Email:</span>{' '}
                {initialEstimate?.customerEmail || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="font-medium text-foreground">Jobsite:</span>{' '}
                {initialEstimate?.jobsiteAddress?.street}, {initialEstimate?.jobsiteAddress?.suburb},{' '}
                {initialEstimate?.jobsiteAddress?.state} {initialEstimate?.jobsiteAddress?.postcode}
              </div>
            </div>
          </div>
        </div>

        {Object.entries(groupedByOption).map(([optionLabel, optionItems], i) => {
          const equipment = optionItems.filter(i => i.type === 'equipment')
          const materials = optionItems.filter(i => i.type === 'material')
          const additionalItems = optionItems.filter(i => i.type === 'other')

          const estimateOption = initialEstimate.options.find(opt => opt.label === optionLabel)
          const shapes = (estimateOption?.shapeEntries || []).map((shape: any) => ({
            name: shape.label,
            area: Number(shape.area),
            types: shape.areaTypes,
          }))

          return (
            <OptionGroup
              key={optionLabel}
              index={i}
              option={{
                label: optionLabel,
                shapes,
                equipment,
                materials,
                additionalItems,
                notes: (estimateOption as any)?.notes ?? '',
              }}
              allItems={items}
              initialEstimate={initialEstimate}
              materialMap={materialMap}
            />
          )
        })}

        {ready && (
          <QuoteSummary
            items={items}
            includedOptions={includedOptions}
            setIncludedOptions={setIncludedOptions}
          />
        )}

        <div className="flex justify-between items-center gap-4">
          <Button type="submit">Save Quote</Button>

          <PDFDownloadLink
            document={
              <QuotePdf
                jobName="SCSD Estimate"
                customerName={`${initialEstimate.firstName} ${initialEstimate.lastName}`}
                jobsiteAddress={`${initialEstimate.jobsiteAddress.street}, ${initialEstimate.jobsiteAddress.suburb}, ${initialEstimate.jobsiteAddress.state} ${initialEstimate.jobsiteAddress.postcode}`}
                selectedOptions={Object.entries(includedOptions)
                  .filter(([_, val]) => val)
                  .map(([label]) => label)}
                items={items}
                markupPercentage={markupPercentage}
              />
            }
            fileName={`SCSD_Quote_${initialEstimate.lastName}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" type="button">
                {loading ? 'Preparing PDF...' : 'Download Quote PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </form>
    </FormProvider>
  )
}




