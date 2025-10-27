import EventsFormPage from "@/features/events/form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/events/form/$eventId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { eventId } = Route.useParams();

  return <EventsFormPage id={eventId} />;
}
