import { EventsPageClient } from "@/components/events/events-page-client";

export const metadata = {
  title: "Events",
  description: "Manage bookable event types",
};

export default function EventsPage() {
  return <EventsPageClient />;
}
