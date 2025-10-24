import { createFileRoute } from "@tanstack/react-router";
import MainPage from "@/features/main";

export const Route = createFileRoute("/")({
  component: MainPage,
});
