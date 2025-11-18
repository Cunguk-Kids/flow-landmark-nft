import { createFileRoute } from "@tanstack/react-router";
import { useEventList } from "@/hooks/useEventList";
import { EventCard } from "@/components/EventCard";
import { motion } from "motion/react";

export const Route = createFileRoute("/events")({
  component: Events,
});

function Events() {
  const { data: events, isLoading, error } = useEventList();

  return (
    <div className="bg-red-400">
      <motion.div
        className="min-h-screen  p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-display text-5xl md:text-7xl leading-tight mb-4">
              All Events
            </h1>
            <p className="text-lg">
              Discover amazing events happening near you
            </p>
          </div>

          {/* Events Grid */}
          {isLoading && (
            <div className="text-center text-muted-foreground py-12">
              Loading events...
            </div>
          )}

          {error && (
            <div className="text-center text-destructive py-12">
              Failed to load events. Please try again.
            </div>
          )}

          {events && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
