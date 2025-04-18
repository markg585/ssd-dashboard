"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  View,
  SlotInfo,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enAU } from "date-fns/locale";
import { getAllSchedules, deleteSchedule } from "@/lib/firestore/schedules";
import { ScheduleModal } from "./modal/ScheduleModal"; // ✅ use modular version
import { toast } from "sonner";

const locales = {
  "en-AU": enAU,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type ScheduleEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  jobsiteId?: string;
  customerId?: string;
  customerName?: string;
  jobsiteRef?: string;
  address?: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
};

export default function CalendarScheduler() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadEvents = async () => {
    const data = await getAllSchedules();
    setEvents(data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSelectSlot = (slot: SlotInfo) => {
    setSelectedSlot(slot);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedEvent?.id) {
      await deleteSchedule(selectedEvent.id);
      toast.success("Job deleted");
      loadEvents();
      setModalOpen(false);
    }
  };

  const CustomEvent = ({ event }: { event: ScheduleEvent }) => (
    <div className="flex flex-col leading-tight">
      <div className="font-semibold">{event.title || "Untitled Job"}</div>
      {event.customerName && (
        <div className="text-sm text-white/90">{event.customerName}</div>
      )}
      {event.address?.street && (
        <div className="text-xs">
          {event.address.street}, {event.address.suburb}
        </div>
      )}
    </div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Job Schedule</h2>
      <div className="bg-white rounded-xl border shadow p-4">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={currentDate}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          views={["month", "week", "day"]}
          selectable
          popup
          scrollToTime={new Date(1970, 1, 1, 7)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#22c55e",
              color: "#fff",
              borderRadius: "0.5rem",
              padding: "0.25rem 0.5rem",
              fontWeight: "500",
            },
          })}
          components={{
            event: CustomEvent,
            month: { event: CustomEvent },
          }}
        />
      </div>

      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadEvents}
        onDelete={selectedEvent ? handleDelete : undefined}
        existingId={selectedEvent?.id}
        defaultValues={
          selectedEvent
            ? selectedEvent
            : {
                title: "",
                start: selectedSlot?.start || new Date(),
                end: selectedSlot?.end || new Date(),
                jobsiteId: "",
              }
        }
      />
    </>
  );
}
















