import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/hooks";
import { formatEvent } from "@/hooks";
import { formatDateTime } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import IconTech from "@/assets/icon/icon-tech.png";
import IconArt from "@/assets/icon/icon-art.png";
import IconSport from "@/assets/icon/icon-sport.png";

export function EventCategoryIcon(props: { category: string }) {
  let icon;
  if (props.category.toLowerCase().includes("tech")) {
    icon = IconTech;
  } else if (props.category.toLowerCase().includes("art")) {
    icon = IconArt;
  } else if (props.category.toLowerCase().includes("sport")) {
    icon = IconSport;
  }

  return (
    <div className="rounded-full w-8 h-8 drop-shadow-lg shadow-gray-600 overflow-clip backdrop-blur-3xl">
      <img src={icon} alt="icon" className="w-40" />
    </div>
  );
}
export function EventMarkerContent(props: { event: Event }) {
  const formatted = formatEvent(props.event);

  return (
    <div className="p-2 flex flex-col gap-3">
      <div className="flex justify-between">
        <Badge>{formatted.statusLabel}</Badge>
        <EventCategoryIcon category="" />
      </div>
      <div className="flex flex-col">
        <h4 className="font-bold text-xl">{formatted.eventName}</h4>
        <p className="text-xs text-gray-600 text-ellipsis">
          by {props.event.brandAddress}
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
