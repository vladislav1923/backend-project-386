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

export function isSlotBooked(slotId: string): boolean {
  return getStore().some((booking) => booking.slotId === slotId);
}

export function createBooking(body: BookRequest): Booking {
  if (isSlotBooked(body.slotId)) {
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
