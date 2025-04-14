import { db } from './firebase'
import {
  collectionGroup,
  getDocs,
  deleteDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Estimate, EstimateOption } from '@/types/estimate'

// 🔁 Transform Firestore doc into Estimate shape
function transformEstimate(doc: QueryDocumentSnapshot<DocumentData>): Estimate {
  const data = doc.data()
  const createdAt = data.createdAt?.toDate?.()

  return {
    id: doc.id,
    ref: doc.ref.path,
    customerName: data.customerName ?? '',
    customerEmail: data.customerEmail ?? '',
    phone: data.phone ?? '', // ✅ Add this line
    address: data.address ?? '',
    details: data.details ?? '',
    createdAt: createdAt?.toISOString() ?? '',
    createdAtFormatted: createdAt
      ? createdAt.toLocaleDateString('en-AU')
      : '—',
    options: data.options as Record<string, EstimateOption>,
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
