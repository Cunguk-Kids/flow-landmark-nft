import type { Event } from "@/hooks/useEventList";
import { MapPin, Clock } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // Parse date
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <div className="group relative">
      {/* Card Container */}
      <div className="bg-card rounded-4xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary/20 to-accent/20">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            // Placeholder for events without images
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🎉
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-6 bg-card">
          {/* Date Badge and Location */}
          <div className="flex items-start gap-4 mb-3">
            {/* Date Badge */}
            <div className="flex flex-col items-center border-r-2 border-border pr-4 min-w-[60px]">
              <span className="text-sm font-medium text-muted-foreground">
                {month}
              </span>
              <span className="text-4xl font-bold text-card-foreground leading-none">
                {day}
              </span>
            </div>

            {/* Location and Title */}
            <div className="flex-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="size-4" />
                <span>{event.location}</span>
              </div>

              <h3 className="text-display text-xl font-bold text-card-foreground leading-tight mb-2">
                {event.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>Starts from {event.organizer}</span>
            </div>

            {event.price > 0 ? (
              <span className="text-sm font-bold text-primary">
                ${event.price}
              </span>
            ) : (
              <span className="text-sm font-bold text-primary">Free</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
