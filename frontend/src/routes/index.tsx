import { createFileRoute, redirect } from "@tanstack/react-router";
import MainPage from "@/features/main";

export const Route = createFileRoute("/")({
  component: MainPage,
  beforeLoad: () => {
    // Check if this is the user's first visit
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      // Mark as visited
      localStorage.setItem("hasVisited", "true");
      // Redirect to landing page
      throw redirect({
        to: "/landing",
      });
    }
  },
});
