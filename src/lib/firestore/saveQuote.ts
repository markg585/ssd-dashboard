import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function saveQuoteToFirestore(data: any) {
  const docRef = await addDoc(collection(db, 'quotes'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}
