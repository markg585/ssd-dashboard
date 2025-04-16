'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  where,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NewLeadDialog from '@/components/leads/NewLeadDialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  notes?: string;
  services?: string[];
  address?: {
    street: string;
    suburb: string;
    postcode: string;
    state: string;
  };
  status: 'inquired' | 'estimate completed' | 'quoted' | 'accepted' | 'declined';
  createdAt?: any;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');

  const fetchLeads = async () => {
    const ref = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(ref);
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Lead[];
    setLeads(data);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (leadId: string) => {
    await deleteDoc(doc(db, 'leads', leadId));
    toast.success('Lead deleted');
    fetchLeads();
  };

  const handleConvert = async (lead: Lead) => {
    try {
      // 1. Try to find an existing customer by email
      let customerId = '';
      if (lead.email) {
        const matchQuery = query(
          collection(db, 'customers'),
          where('email', '==', lead.email)
        );
        const matchSnap = await getDocs(matchQuery);
        if (!matchSnap.empty) {
          customerId = matchSnap.docs[0].id;
        }
      }

      // 2. If not found, create a new customer
      if (!customerId) {
        const newCustomer = await addDoc(collection(db, 'customers'), {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          createdAt: serverTimestamp(),
        });
        customerId = newCustomer.id;
      }

      // 3. Create estimate under that customer
      await addDoc(collection(db, `customers/${customerId}/jobsites`), {
        customerId,
        jobAddress: lead.address,
        services: lead.services || [],
        notes: lead.notes || '',
        createdAt: serverTimestamp(),
      });

      // 4. Update lead status
      await setDoc(
        doc(db, 'leads', lead.id),
        { status: 'estimate completed' },
        { merge: true }
      );

      toast.success('Converted to estimate');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to convert lead');
    }
  };

  const filtered = leads.filter((lead) => {
    const name = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || lead.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Leads</h1>
        <NewLeadDialog onCreated={fetchLeads} />
      </div>

      <Input
        placeholder="Search leads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-muted transition">
                <td className="p-3 font-medium">{lead.firstName} {lead.lastName}</td>
                <td className="p-3">{lead.phone || '-'}</td>
                <td className="p-3">
                  {lead.address
                    ? `${lead.address.street}, ${lead.address.suburb}, ${lead.address.state} ${lead.address.postcode}`
                    : '-'}
                </td>
                <td className="p-3">
                  <Badge variant={
                    lead.status === 'accepted' ? 'default' :
                    lead.status === 'declined' ? 'destructive' :
                    'secondary'
                  }>
                    {lead.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleConvert(lead)}>
                        Convert to Estimate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-muted-foreground">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}


