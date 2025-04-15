import { db } from './firebase'
import {
  collectionGroup,
  getDocs,
  deleteDoc,
  doc,
  collection,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Estimate, EstimateOption } from '@/types/estimate'

// 🔧 Format address into display string if needed
export function formatAddress(addr: {
  street?: string
  suburb?: string
  state?: string
  postcode?: string
}) {
  return [addr.street, addr.suburb, addr.state, addr.postcode].filter(Boolean).join(', ')
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
    createdAt: createdAt?.toISOString() ?? '',
    createdAtFormatted: createdAt
      ? createdAt.toLocaleDateString('en-AU')
      : '—',
    options: data.options as EstimateOption[], // ✅ changed from Record<string, ...>
  }
}

// ✅ Get all estimates
export async function getAllEstimates(): Promise<Estimate[]> {
  const snapshot = await getDocs(collectionGroup(db, 'jobsites'))
  return snapshot.docs.map(transformEstimate)
}

// ✅ Get one estimate by ID
export async function getEstimateById(id: string): Promise<Estimate | null> {
  const snapshot = await getDocs(collectionGroup(db, 'jobsites'))
  const docMatch = snapshot.docs.find((d) => d.id === id)
  return docMatch ? transformEstimate(docMatch) : null
}

// ✅ Delete estimate by ref path
export async function deleteEstimateById(refPath: string): Promise<void> {
  const docRef = doc(db, refPath)
  await deleteDoc(docRef)
}

// ✅ Get material options from Firestore
export async function getMaterialsList() {
  const snapshot = await getDocs(collection(db, 'materials'))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as {
      item: string
      type: string
    })
  }))
}


