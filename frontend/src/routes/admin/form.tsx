import FormPage from "@/features/admin/components/Form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/form")({
  component: FormPage,
});
