"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { createSchedule, updateSchedule } from "@/lib/firestore/schedules";
import {
  getAllJobsites,
  createJobsiteForCustomer,
} from "@/lib/firestore/jobsites";
import { getAllCustomers } from "@/lib/firestore/customers";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ScheduleJobDetails } from "./ScheduleJobDetails";
import { ScheduleCustomerSelector } from "./ScheduleCustomerSelector";
import { ScheduleJobsiteSelector } from "./ScheduleJobsiteSelector";
import { ScheduleAddressFields } from "./ScheduleAddressFields";

function generateTimes() {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return times;
}

function hasAddress(addr: any) {
  return addr?.street || addr?.suburb || addr?.postcode;
}

export function ScheduleModal({
  open,
  onClose,
  onCreated,
  onDelete,
  existingId,
  defaultValues,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onDelete?: () => void;
  existingId?: string;
  defaultValues: any;
}) {
  const form = useForm({
    defaultValues: {
      title: defaultValues.title || "",
      startTime: format(defaultValues.start, "HH:mm"),
      endTime: format(defaultValues.end, "HH:mm"),
      jobsiteId: defaultValues.jobsiteId ?? "",
      address: defaultValues.address || {
        street: "",
        suburb: "",
        state: "",
        postcode: "",
      },
      customerId: defaultValues.customerId ?? "",
    },
  });

  const { register, handleSubmit, watch, setValue, reset } = form;
  const [jobsites, setJobsites] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);

  const handleCustomerCreated = (id: string, name: string) => {
    setCustomers((prev) => [...prev, { id, name }]);
    setValue("customerId", id);
  };

  useEffect(() => {
    reset({
      title: defaultValues.title || "",
      startTime: format(defaultValues.start, "HH:mm"),
      endTime: format(defaultValues.end, "HH:mm"),
      jobsiteId: defaultValues.jobsiteId ?? "",
      address: defaultValues.address || {
        street: "",
        suburb: "",
        state: "",
        postcode: "",
      },
      customerId: defaultValues.customerId ?? "",
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    getAllJobsites().then(setJobsites);
    getAllCustomers().then(setCustomers);
  }, []);

  useEffect(() => {
    const jobsiteId = watch("jobsiteId");
    if (jobsiteId) {
      const selected = jobsites.find((j) => j.id === jobsiteId);
      if (selected?.jobsiteAddress) {
        setValue("address", selected.jobsiteAddress);
      }
      if (selected?.customerId) {
        setValue("customerId", selected.customerId);
      }
    }
  }, [watch("jobsiteId")]);

  const onSubmit = async (data: any) => {
    if (!data.customerId) {
      toast.error("Customer is required");
      return;
    }

    const [startHour, startMinute] = data.startTime.split(":" ).map(Number);
    const [endHour, endMinute] = data.endTime.split(":" ).map(Number);

    const start = new Date(defaultValues.start);
    const end = new Date(defaultValues.end);
    start.setHours(startHour, startMinute);
    end.setHours(endHour, endMinute);

    let jobsiteId = data.jobsiteId;
    let jobsiteRef = null;

    const customer = customers.find((c) => c.id === data.customerId);

    if (!jobsiteId && hasAddress(data.address)) {
      jobsiteId = await createJobsiteForCustomer(data.customerId, data.address, {
        firstName: customer?.firstName,
        lastName: customer?.lastName,
        email: customer?.email,
        leadId: customer?.leadId,
      });
      jobsiteRef = `customers/${data.customerId}/jobsites/${jobsiteId}`;
    } else if (jobsiteId) {
      jobsiteRef = `customers/${data.customerId}/jobsites/${jobsiteId}`;
    }

    const customerName = customer?.name || "";

    const payload = {
      title: data.title,
      start,
      end,
      jobsiteId: jobsiteId || null,
      jobsiteRef: jobsiteRef || null,
      customerId: data.customerId,
      customerName,
      address: data.address,
    };

    if (existingId) {
      await updateSchedule(existingId, payload);
      toast.success("Job updated");
    } else {
      await createSchedule(payload);
      toast.success("Job added");
    }

    onCreated();
    onClose();
  };

  const jobsiteSelected = !!watch("jobsiteId");
  const selectedCustomerId = watch("customerId");
  const filteredJobsites = jobsites.filter(
    (site) => !selectedCustomerId || site.customerId === selectedCustomerId
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingId ? "Edit Job" : "New Job"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ScheduleJobDetails
            title={watch("title")}
            startTime={watch("startTime")}
            endTime={watch("endTime")}
            times={generateTimes()}
            setTitle={(val) => setValue("title", val)}
            setStartTime={(val) => setValue("startTime", val)}
            setEndTime={(val) => setValue("endTime", val)}
          />

          <ScheduleCustomerSelector
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={(val) => setValue("customerId", val)}
            onNew={() => setNewCustomerOpen(true)}
          />

          <ScheduleJobsiteSelector
            jobsites={filteredJobsites}
            selectedJobsiteId={watch("jobsiteId")}
            onSelect={(val) => setValue("jobsiteId", val)}
          />

          <ScheduleAddressFields
            address={watch("address")}
            disabled={jobsiteSelected}
            onChange={(field, val) =>
              setValue(`address.${field}`, val)
            }
          />

          <div className="flex justify-between pt-4">
            {existingId ? (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </form>

        <NewCustomerDialog
          open={newCustomerOpen}
          onClose={() => setNewCustomerOpen(false)}
          onCreated={handleCustomerCreated}
        />
      </DialogContent>
    </Dialog>
  );
}

