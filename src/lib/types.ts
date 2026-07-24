/** Types aligned with TypeSpec models in main.tsp */

export type User = {
  id: string;
  name: string;
};

export type EventType = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  user: User;
};

export type CreateEventTypeRequest = {
  title: string;
  description: string;
  durationMinutes: number;
};
