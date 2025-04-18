"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ScheduleJobsiteSelector({
  jobsites,
  selectedJobsiteId,
  onSelect,
}: {
  jobsites: {
    id: string;
    title: string;
    jobsiteAddress?: {
      street?: string;
      suburb?: string;
      state?: string;
      postcode?: string;
    };
    customerId?: string;
  }[];
  selectedJobsiteId: string;
  onSelect: (jobsiteId: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">Jobsite</Label>
      <Select value={selectedJobsiteId} onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select jobsite..." />
        </SelectTrigger>
        <SelectContent>
          {jobsites.map((site) => {
            const addr = site.jobsiteAddress;
            const label = addr
              ? `${addr.street}${addr.suburb ? ", " + addr.suburb : ""}`
              : "Unnamed jobsite";
            return (
              <SelectItem key={site.id} value={site.id}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
