"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScheduleAddressFields({
  address,
  disabled,
  onChange,
}: {
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  disabled: boolean;
  onChange: (field: keyof typeof address, value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-muted-foreground">Address</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input
          placeholder="Street"
          value={address.street}
          onChange={(e) => onChange("street", e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="Suburb"
          value={address.suburb}
          onChange={(e) => onChange("suburb", e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="State"
          value={address.state}
          onChange={(e) => onChange("state", e.target.value)}
          disabled={disabled}
        />
        <Input
          placeholder="Postcode"
          value={address.postcode}
          onChange={(e) => onChange("postcode", e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
