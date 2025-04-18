"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ScheduleCustomerSelector({
  customers,
  selectedCustomerId,
  onSelect,
  onNew,
}: {
  customers: { id: string; name: string }[];
  selectedCustomerId: string;
  onSelect: (val: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">Customer</Label>
      <div className="flex items-center gap-2">
        <Select value={selectedCustomerId} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select customer..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((cust) => (
              <SelectItem key={cust.id} value={cust.id}>
                {cust.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" size="sm" onClick={onNew}>
          + New
        </Button>
      </div>
    </div>
  );
}
