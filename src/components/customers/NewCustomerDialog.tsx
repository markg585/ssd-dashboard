"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { createCustomer } from "@/lib/firestore/customers";
import { toast } from "sonner";

export function NewCustomerDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const id = await createCustomer(data);
      onCreated(id, `${data.firstName} ${data.lastName}`);
      toast.success("Customer created");
      reset();
      onClose();
    } catch (err) {
      toast.error("Error creating customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>First Name</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
          </div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          <Label>Phone</Label>
          <Input type="tel" {...register("phone")} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
