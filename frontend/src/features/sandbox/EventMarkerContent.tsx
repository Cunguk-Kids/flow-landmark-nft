import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/hooks";
import { formatEvent } from "@/hooks";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";

export function EventMarkerContent(props: { event: Event }) {
  const formatted = formatEvent(props.event);

  return (
    <div className="p-2 flex flex-col gap-3">
      <div className="flex justify-between">
        <Badge>{formatted.statusLabel}</Badge>
      </div>
      <div className="flex flex-col">
        <h4 className="font-bold text-xl">{formatted.eventName}</h4>
        <p className="text-xs text-gray-600 text-ellipsis">
          by {props.event.edges?.partner?.address}
        </p>
      </div>
      <div className="flex items-start text-xs gap-1">
        <div className="self-start flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDateTime(formatted.startDateTime.toISOString(), "date")}</span>
        </div>
        <span>•</span>
        <div className="self-end flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatDateTime(formatted.startDateTime.toISOString(), "time")}</span>
        </div>
      </div>

      <Button className="w-full" asChild>
        <Link
          to="/events/details/$eventId"
          params={{ eventId: props.event.id.toString() }}
        >
          View Detail
        </Link>
      </Button>
    </div>
  );
}
