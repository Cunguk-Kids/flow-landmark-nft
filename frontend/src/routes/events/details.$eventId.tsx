import EventsDetailsPage from "@/features/events/details";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/details/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { eventId } = Route.useParams();

  return <EventsDetailsPage id={eventId} />;
}
