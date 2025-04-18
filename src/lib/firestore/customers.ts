import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export const getAllCustomers = async () => {
  const snapshot = await getDocs(collection(db, "customers"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: `${doc.data().firstName} ${doc.data().lastName}`,
    ...doc.data(),
  }));
};

export const createCustomer = async (data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}) => {
  const docRef = await addDoc(collection(db, "customers"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

