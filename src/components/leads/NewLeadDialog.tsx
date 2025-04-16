'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ServiceOption = 'Prep' | 'Bitumen' | 'Asphalt';
const SERVICE_OPTIONS: ServiceOption[] = ['Prep', 'Bitumen', 'Asphalt'];

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  street: z.string().min(1),
  suburb: z.string().min(1),
  postcode: z.string().min(1),
  state: z.string().min(1),
  notes: z.string().optional(),
  source: z.enum(['email', 'phone', 'referral']),
  services: z.array(z.enum(['Prep', 'Bitumen', 'Asphalt'])).min(1),
});

type FormData = z.infer<typeof schema>;

export default function NewLeadDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      services: [],
      source: 'email',
    },
  });

  const services = watch('services') as ServiceOption[];

  const onCheckboxChange = (value: ServiceOption) => {
    const newServices = services.includes(value)
      ? services.filter((v) => v !== value)
      : [...services, value];

    setValue('services', newServices);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await addDoc(collection(db, 'leads'), {
        ...data,
        address: {
          street: data.street,
          suburb: data.suburb,
          postcode: data.postcode,
          state: data.state,
        },
        status: 'inquired',
        createdAt: serverTimestamp(),
      });
      toast.success('Lead created');
      setOpen(false);
      onCreated?.();
    } catch {
      toast.error('Failed to create lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">+ New Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input {...register('firstName')} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register('lastName')} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <div>
              <Label>Email</Label>
              <Input {...register('email')} />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>Street</Label>
            <Input {...register('street')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Suburb</Label>
              <Input {...register('suburb')} />
            </div>
            <div>
              <Label>Postcode</Label>
              <Input {...register('postcode')} />
            </div>
            <div>
              <Label>State</Label>
              <Input {...register('state')} />
            </div>
          </div>

          {/* Source */}
          <div>
            <Label>How did they inquire?</Label>
            <RadioGroup
              defaultValue="email"
              onValueChange={(val) => setValue('source', val as FormData['source'])}
              className="flex flex-wrap gap-4 pt-1"
            >
              {['email', 'phone', 'referral'].map((method) => (
                <div key={method} className="flex items-center gap-2">
                  <RadioGroupItem value={method} id={method} />
                  <Label htmlFor={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Services */}
          <div>
            <Label>What are they after?</Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {SERVICE_OPTIONS.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <Checkbox
                    id={service}
                    checked={services.includes(service)}
                    onCheckedChange={() => onCheckboxChange(service)}
                  />
                  <Label htmlFor={service}>{service}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea {...register('notes')} />
          </div>

          <Button type="submit" className="w-full">Save Lead</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}



