import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EventType } from "@/lib/types";
import { ClockIcon } from "lucide-react";

type EventTypeCardProps = {
  eventType: EventType;
};

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{eventType.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            <ClockIcon data-icon="inline-start" />
            {eventType.durationMinutes} min
          </Badge>
        </div>
        <CardDescription className="line-clamp-3">
          {eventType.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <span>by {eventType.user.name}</span>
        <span className="font-mono">{eventType.id.slice(0, 8)}</span>
      </CardFooter>
    </Card>
  );
}
