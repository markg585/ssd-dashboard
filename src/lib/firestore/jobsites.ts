// lib/firestore/jobsites.ts
import { db } from "@/lib/firebase";
import { getDocs, collection, addDoc } from "firebase/firestore";

// ✅ Get all jobsites (used for dropdown)
export async function getAllJobsites() {
  const customersSnap = await getDocs(collection(db, "customers"));
  const jobsites: { id: string; title: string; customerId?: string; jobsiteAddress?: any }[] = [];

  for (const customerDoc of customersSnap.docs) {
    const customerId = customerDoc.id;
    const jobsiteSnap = await getDocs(
      collection(db, "customers", customerId, "jobsites")
    );

    jobsiteSnap.forEach((doc) => {
      const data = doc.data();
      const name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
      const address = data.jobsiteAddress
        ? `${data.jobsiteAddress.street}, ${data.jobsiteAddress.suburb}`
        : "";

      jobsites.push({
        id: doc.id,
        title: `${name} – ${address}`.trim(),
        customerId,
        jobsiteAddress: data.jobsiteAddress,
      });
    });
  }

  // 🟣 Also pull in any standalone subcontractor jobsites
  const generalJobsiteSnap = await getDocs(collection(db, "jobsites"));
  generalJobsiteSnap.forEach((doc) => {
    const data = doc.data();
    const address = data.jobsiteAddress
      ? `${data.jobsiteAddress.street}, ${data.jobsiteAddress.suburb}`
      : "Untitled";

    jobsites.push({
      id: doc.id,
      title: address,
      jobsiteAddress: data.jobsiteAddress,
    });
  });

  return jobsites;
}

// ✅ Lookup full jobsite info by ID (across all customers)
export async function getJobsiteById(jobsiteId: string) {
  const customersSnap = await getDocs(collection(db, "customers"));

  for (const customerDoc of customersSnap.docs) {
    const jobsiteSnap = await getDocs(
      collection(db, "customers", customerDoc.id, "jobsites")
    );

    const match = jobsiteSnap.docs.find((doc) => doc.id === jobsiteId);
    if (match) return match.data();
  }

  // 🔍 Also search general jobsites (subcontractor-created)
  const generalJobsiteSnap = await getDocs(collection(db, "jobsites"));
  const generalMatch = generalJobsiteSnap.docs.find((doc) => doc.id === jobsiteId);
  if (generalMatch) return generalMatch.data();

  return null;
}

// ✅ Create a standalone jobsite for subcontractor jobs
export async function createJobsiteForSubcontractor(address: {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}) {
  const docRef = await addDoc(collection(db, "jobsites"), {
    jobsiteAddress: address,
    createdAt: new Date(),
    source: "schedule",
  });

  return docRef.id;
}

// ✅ Create a jobsite nested under a customer with full metadata
export async function createJobsiteForCustomer(
  customerId: string,
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  },
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    leadId?: string;
  }
) {
  const ref = collection(db, `customers/${customerId}/jobsites`);
  const docRef = await addDoc(ref, {
    jobsiteAddress: address,
    customerId,
    customerEmail: customerInfo?.email || "",
    firstName: customerInfo?.firstName || "",
    lastName: customerInfo?.lastName || "",
    leadId: customerInfo?.leadId || "",
    createdAt: new Date(),
    source: "schedule",
  });

  return docRef.id;
}


