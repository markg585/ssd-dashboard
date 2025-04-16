'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Customer = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // fallback if name exists
  email?: string;
  phone?: string;
  address?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      const ref = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(ref);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];
      setCustomers(data);
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase();
    return (
      fullName.includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Customers</h1>
        <Button variant="outline">+ New Customer</Button>
      </div>

      <Input
        placeholder="Search by name or email..."
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
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-muted transition">
                <td className="p-3 font-medium">
                  {c.firstName && c.lastName
                    ? `${c.firstName} ${c.lastName}`
                    : c.name || 'Unnamed'}
                </td>
                <td className="p-3">{c.phone || '-'}</td>
                <td className="p-3">{c.email || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-muted-foreground">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

