import EventsDetailsPage from "@/features/events/details";
import { useEventDetail } from "@/hooks/useEventDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/details/$eventId")({
  component: EventsDetailsPage,
  loader: async (ctx) => {
    const detail = await useEventDetail.fetch(+ctx.params.eventId);
    return {
      event: detail,
    };
  },
});
