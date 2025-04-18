import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export async function getAllSchedules() {
  const ref = collection(db, "schedules");
  const snapshot = await getDocs(ref);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Untitled Job",
        start: data.start.toDate(),
        end: data.end.toDate(),
        jobsiteId: data.jobsiteId || null,
        jobsiteRef: data.jobsiteRef || null,
        address: data.address || null,
        customerId: data.customerId || null,
        customerName: data.customerName || null,
        subcontractor: data.subcontractor || false,
        color: data.color || "gray",
        deleted: data.deleted || false,
      };
    })
    .filter((job) => !job.deleted);
}

export async function createSchedule(data: any) {
  return await addDoc(collection(db, "schedules"), {
    ...data,
    createdAt: new Date(),
  });
}

export async function updateSchedule(id: string, data: any) {
  return await setDoc(doc(db, "schedules", id), data, { merge: true });
}

export async function deleteSchedule(id: string) {
  return await deleteDoc(doc(db, "schedules", id));
}



