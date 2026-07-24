import { getEventType } from "@/lib/event-types-store";
import type { Booking, BookRequest } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & {
  __bookingsStore?: Booking[];
};

function getStore(): Booking[] {
  if (!globalStore.__bookingsStore) {
    globalStore.__bookingsStore = [];
  }
  return globalStore.__bookingsStore;
}

export function listBookings(): Booking[] {
  return [...getStore()];
}

export function parseSlotDatetime(slotId: string): Date | null {
  const separator = slotId.indexOf(":");
  if (separator === -1) {
    return null;
  }

  const date = new Date(slotId.slice(separator + 1));
  return Number.isNaN(date.getTime()) ? null : date;
}

function intervalEnd(start: Date, durationMinutes: number): number {
  return start.getTime() + durationMinutes * 60_000;
}

/** True when [aStart, aEnd) overlaps [bStart, bEnd). */
export function intervalsOverlap(
  aStart: Date,
  aDurationMinutes: number,
  bStart: Date,
  bDurationMinutes: number,
): boolean {
  const aEnd = intervalEnd(aStart, aDurationMinutes);
  const bEnd = intervalEnd(bStart, bDurationMinutes);
  return aStart.getTime() < bEnd && bStart.getTime() < aEnd;
}

export function getBookingInterval(
  booking: Booking,
): { start: Date; durationMinutes: number } | null {
  const start = parseSlotDatetime(booking.slotId);
  if (!start) {
    return null;
  }

  const eventType = getEventType(booking.eventTypeId);
  if (!eventType) {
    return null;
  }

  return { start, durationMinutes: eventType.durationMinutes };
}

/** Any existing booking that overlaps the proposed time window. */
export function findOverlappingBooking(
  start: Date,
  durationMinutes: number,
): Booking | undefined {
  return getStore().find((booking) => {
    const interval = getBookingInterval(booking);
    if (!interval) {
      return false;
    }

    return intervalsOverlap(
      start,
      durationMinutes,
      interval.start,
      interval.durationMinutes,
    );
  });
}

export function isTimeOccupied(
  start: Date,
  durationMinutes: number,
): boolean {
  return Boolean(findOverlappingBooking(start, durationMinutes));
}

export function createBooking(
  body: BookRequest,
  durationMinutes: number,
): Booking {
  const start = parseSlotDatetime(body.slotId);
  if (!start) {
    throw new Error("INVALID_SLOT");
  }

  if (isTimeOccupied(start, durationMinutes)) {
    throw new Error("SLOT_OCCUPIED");
  }

  const booking: Booking = {
    id: crypto.randomUUID(),
    slotId: body.slotId,
    eventTypeId: body.eventTypeId,
    guest: body.guest,
  };

  getStore().push(booking);
  return booking;
}
