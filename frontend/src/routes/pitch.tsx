import { createFileRoute } from "@tanstack/react-router";
import PitchDeck from "@/features/pitch";

export const Route = createFileRoute("/pitch")({
  component: PitchDeck,
});
