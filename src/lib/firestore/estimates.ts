import { db } from '../firebase'
import {
  collectionGroup,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import type { Estimate, EstimateOption } from '@/types/estimate'

// Define equipment item type so TS knows what we're dealing with
type EstimateEquipmentItem = {
  item: string
  category: 'Prep' | 'Bitumen' | 'Asphalt'
  units: number
  hours: number
  days: number
  price?: number
}

// 🔁 Transform Firestore doc into Estimate shape
function transformEstimate(doc: QueryDocumentSnapshot<DocumentData>): Estimate {
  const data = doc.data()
  const createdAt = data.createdAt?.toDate?.()

  return {
    id: doc.id,
    ref: doc.ref.path,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    customerEmail: data.customerEmail ?? '',
    phone: data.phone ?? '',
    jobsiteAddress: {
      street: data.jobsiteAddress?.street ?? '',
      suburb: data.jobsiteAddress?.suburb ?? '',
      postcode: data.jobsiteAddress?.postcode ?? '',
      state: data.jobsiteAddress?.state ?? '',
    },
    details: data.details ?? '',
    additionalItems: data.additionalItems ?? [],
    jobNotes: data.jobNotes ?? '',
    createdAt: createdAt?.toISOString() ?? '',
    createdAtFormatted: createdAt
      ? createdAt.toLocaleDateString('en-AU')
      : '—',
    options: (data.options ?? []).map((option: EstimateOption) => {
      return {
        ...option,
        equipment: (option.equipment ?? []).map((item: EstimateEquipmentItem) => ({
          ...item,
        })),
        materials: option.materials ?? [],
        shapeEntries: option.shapeEntries ?? [],
      }
    }),
    customerId: data.customerId ?? '',
    leadId: data.leadId ?? '',
  }
}

export async function getEstimateById(id: string): Promise<Estimate | null> {
  const snapshot = await getDocs(collectionGroup(db, 'jobsites'))
  const docMatch = snapshot.docs.find((d) => d.id === id)
  return docMatch ? transformEstimate(docMatch) : null
}
