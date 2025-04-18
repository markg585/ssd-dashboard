"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function ScheduleJobDetails({
  title,
  startTime,
  endTime,
  times,
  setTitle,
  setStartTime,
  setEndTime,
}: {
  title: string;
  startTime: string;
  endTime: string;
  times: string[];
  setTitle: (val: string) => void;
  setStartTime: (val: string) => void;
  setEndTime: (val: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label>Job Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Start</Label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger>
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>End</Label>
          <Select value={endTime} onValueChange={setEndTime}>
            <SelectTrigger>
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
