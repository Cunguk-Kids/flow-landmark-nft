import { useState } from "react";
import { useEventList, formatEvent } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link } from "@tanstack/react-router";
import { Typhography } from "./ui/typhography";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import { Calendar, MapPin, Users, LucidePartyPopper } from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { store } from "@/stores";

// Shared content component
const EventListContent = ({ onClose }: { onClose: () => void }) => {
  const { data, isLoading, error } = useEventList({ page: 1, limit: 10 });
  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <Typhography variant="t1" className="text-muted-foreground">
            Loading events...
          </Typhography>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-32">
          <Typhography variant="t1" className="text-destructive">
            Failed to load events
          </Typhography>
        </div>
      )}

      {data?.data.map((rawEvent) => {
        const event = formatEvent(rawEvent);
        return (
          <Link
            key={event.id}
            to="/events/details/$eventId"
            params={{ eventId: event.id.toString() }}
            className="block dark"
          >
            <div className="bg-card hover:bg-accent transition-colors rounded-lg border border-border overflow-hidden cursor-pointer">
              {/* Event Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.eventName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      event.statusLabel === "Active" ? "default" : "secondary"
                    }
                  >
                    <Typhography variant="t3">{event.statusLabel}</Typhography>
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-3 space-y-2">
                <Typhography
                  variant="lg"
                  className="font-semibold line-clamp-1"
                >
                  {event.eventName}
                </Typhography>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} />
                    <Typhography variant="t2">
                      {formatDateTime(
                        event.startDateTime.toISOString(),
                        "date"
                      )}
                    </Typhography>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <Typhography variant="t2" className="line-clamp-1">
                      {event.partner?.name || "Unknown Location"}
                    </Typhography>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={14} />
                    <Typhography variant="t2">
                      {event.participantCount}/{event.quota}{" "}
                      {event.isFull ? "(Full)" : "spots"}
                    </Typhography>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-2">
                  <Button
                    size="sm"
                    variant={
                      event.statusLabel === "Active" && !event.isFull
                        ? "default"
                        : "secondary"
                    }
                    disabled={event.statusLabel !== "Active" || event.isFull}
                    className="flex-1"
                  >
                    <Typhography variant="t2">
                      {event.isFull
                        ? "Full"
                        : event.statusLabel === "Active"
                          ? "Register"
                          : event.statusLabel}
                    </Typhography>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="aspect-square p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      store.state.ref?.getMap().flyTo({
                        center: [event.long, event.lat],
                        zoom: 15,
                        essential: true,
                      });
                      onClose();
                    }}
                  >
                    <MapPin size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {data?.data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <Typhography variant="t1" className="text-muted-foreground">
            No events found
          </Typhography>
          <Typhography variant="t2" className="text-muted-foreground mt-1">
            Check back later for new events
          </Typhography>
        </div>
      )}
    </>
  );
};

const EventListPopup = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  // Desktop: Use Popover
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 bottom-4 z-10 shadow-lg bg-background/95 backdrop-blur-lg"
          >
            <LucidePartyPopper />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={12}
          className={cn(
            "w-80 md:w-96 h-[calc(100vh-8rem)] p-0 overflow-hidden dark"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex flex-col">
              <Typhography variant="2xl" className="font-bold">
                Events Near You
              </Typhography>
              <Typhography variant="t2" className="text-muted-foreground mt-1">
                Discover cultural moments
              </Typhography>
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <EventListContent onClose={handleClose} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile: Use Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 bottom-4 z-10 shadow-lg bg-background/95 backdrop-blur-lg"
        >
          <LucidePartyPopper />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh] dark">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle>
            <Typhography variant="2xl" className="font-bold">
              Events Near You
            </Typhography>
          </DrawerTitle>
          <DrawerDescription>
            <Typhography variant="t2" className="text-muted-foreground">
              Discover cultural moments
            </Typhography>
          </DrawerDescription>
        </DrawerHeader>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 dark">
          <EventListContent onClose={handleClose} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventListPopup;
