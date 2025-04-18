import  CalendarScheduler  from "@/components/schedule/CalendarScheduler";

export default function SchedulePage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Job Schedule</h1>
      <CalendarScheduler />
    </div>
  );
}
