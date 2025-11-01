import TicketsList from "@/features/tickets/list";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tickets/")({
  component: TicketsList,
});
