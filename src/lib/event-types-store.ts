import type { CreateEventTypeRequest, EventType, User } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & {
  __eventTypesStore?: EventType[];
};

function getStore(): EventType[] {
  if (!globalStore.__eventTypesStore) {
    globalStore.__eventTypesStore = [];
  }
  return globalStore.__eventTypesStore;
}

const defaultUser: User = {
  id: "user-1",
  name: "Calendar Owner",
};

export function listEventTypes(): EventType[] {
  return [...getStore()];
}

export function createEventType(body: CreateEventTypeRequest): EventType {
  const eventType: EventType = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    durationMinutes: body.durationMinutes,
    user: defaultUser,
  };

  getStore().unshift(eventType);
  return eventType;
}
