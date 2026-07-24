import { isSlotBooked } from "@/lib/bookings-store";
import type { EventType, Slot } from "@/lib/types";

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateOnly(dateOnly: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateOnly(date: Date): string {
  return toDateOnly(date);
}

export function bookingWindowBounds(from = new Date()): {
  start: Date;
  end: Date;
} {
  const start = startOfLocalDay(from);
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  return { start, end };
}

export function isDateInBookingWindow(date: Date, from = new Date()): boolean {
  const { start, end } = bookingWindowBounds(from);
  const day = startOfLocalDay(date);
  return day >= start && day <= end;
}

/** Consecutive slots for a day, spaced by event duration. */
export function generateAvailableSlots(
  eventType: EventType,
  dateOnly: string,
  now = new Date(),
): Slot[] {
  const day = parseDateOnly(dateOnly);
  if (!day || !isDateInBookingWindow(day, now)) {
    return [];
  }

  const duration = eventType.durationMinutes;
  if (!Number.isFinite(duration) || duration <= 0) {
    return [];
  }

  const slots: Slot[] = [];
  const cursor = new Date(day);
  cursor.setHours(DAY_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(day);
  dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  while (cursor.getTime() + duration * 60_000 <= dayEnd.getTime()) {
    if (cursor.getTime() > now.getTime()) {
      const datetime = cursor.toISOString();
      const id = `${eventType.id}:${datetime}`;
      if (!isSlotBooked(id)) {
        slots.push({
          id,
          datetime,
          eventTypeId: eventType.id,
        });
      }
    }

    cursor.setMinutes(cursor.getMinutes() + duration);
  }

  return slots;
}

export function findSlot(
  eventType: EventType,
  slotId: string,
  now = new Date(),
): Slot | undefined {
  const separator = slotId.indexOf(":");
  if (separator === -1) {
    return undefined;
  }

  const datetime = slotId.slice(separator + 1);
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return generateAvailableSlots(eventType, toDateOnly(date), now).find(
    (slot) => slot.id === slotId,
  );
}
