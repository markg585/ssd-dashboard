import { db } from '@/lib/firebase'
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { Estimate } from '@/types/estimate'
import { Quote, QuoteItem } from '@/types/quote'

// 🧠 Build a full quote from an estimate
export async function createQuoteFromEstimate(estimate: Estimate): Promise<Quote> {
  const items: QuoteItem[] = []

  const [materialsSnap, equipmentSnap] = await Promise.all([
    getDocs(collection(db, 'materials')),
    getDocs(collection(db, 'equipmentItems')),
  ])

  const materialMap = new Map<string, any>()
  const equipmentMap = new Map<string, any>()

  materialsSnap.forEach(doc => {
    const data = doc.data()
    const key = data.item?.toLowerCase().trim()
    if (key) materialMap.set(key, data)
  })

  equipmentSnap.forEach(doc => {
    const data = doc.data()
    const key = data.name?.toLowerCase().trim()
    if (key) equipmentMap.set(key, data)
  })

  for (const option of estimate.options || []) {
    // ✅ Materials
    for (const m of option.materials || []) {
      const key = m.item?.toLowerCase().trim()
      const mat = materialMap.get(key)
      if (!mat) continue

      const sqm = option.totalSqm || 0
      const formula = parseFloat(m.sprayRate?.toString() || '1')
      const quantity = parseFloat((sqm * formula).toFixed(2))
      const unitCost = Number(mat.unitPrice || 0)

      items.push({
        label: `${m.item} – ${option.label}`,
        type: 'material',
        description: `${m.type} | ${formula} L/m² × ${sqm} m²`,
        quantity,
        unitPrice: unitCost,
        unitCost,
        total: parseFloat((quantity * unitCost).toFixed(2)),
      })
    }

    // ✅ Equipment
    for (const e of option.equipment || []) {
      const key = e.item?.toLowerCase().trim()
      const eq = equipmentMap.get(key)
      const unitPrice = Number(eq?.unitPrice ?? eq?.price ?? 0)
      const quantity = (e.units || 0) * (e.hours || 0) * (e.days || 0)

      items.push({
        label: `${e.item} – ${option.label}`,
        type: 'equipment',
        description: `${e.category} | ${e.units} units × ${e.hours} hrs × ${e.days} days`,
        quantity,
        unitPrice,
        unitCost: unitPrice,
        total: parseFloat((quantity * unitPrice).toFixed(2)),
      })
    }
  }

  // ✅ Additional Items
  for (const extra of estimate.additionalItems || []) {
    const quantity = Number(extra.quantity || 0)
    const unitPrice = Number(extra.unitPrice || 0)

    items.push({
      label: extra.description || 'Other',
      type: 'other',
      description: 'Additional',
      quantity,
      unitPrice,
      unitCost: unitPrice,
      total: parseFloat((quantity * unitPrice).toFixed(2)),
    })
  }

  const quote: Quote = {
    id: nanoid(),
    estimateId: estimate.id,
    customerId: estimate.customerId || '',
    customerName: `${estimate.firstName} ${estimate.lastName}`,
    jobsiteAddress: estimate.jobsiteAddress,
    items,
    markupPercentage: 0,
    profit: 0,
    gst: 0,
    total: 0,
    notes: '',
    features: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return quote
}

// 💾 Save quote to Firestore
export async function saveQuoteToFirestore(quote: Quote) {
  const ref = doc(db, 'quotes', quote.id)
  await setDoc(ref, {
    ...quote,
    updatedAt: new Date().toISOString(),
  })
}










