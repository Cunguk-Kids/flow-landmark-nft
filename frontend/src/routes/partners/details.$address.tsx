import PartnerDetailsPage from "@/features/partners/details";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/partners/details/$address")({
  component: PartnerDetailsPage,
  loader: async (ctx) => {
    return {
      address: ctx.params.address,
    };
  },
});
