/**
 * Hook for updating event status (triggers on-chain transaction)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  UpdateEventStatusRequest,
  UpdateEventStatusResponse,
} from "@/types/api";

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEventStatusRequest) =>
      api.post<UpdateEventStatusResponse>("/event/update-status", data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch event detail
      queryClient.invalidateQueries({
        queryKey: ["event", variables.eventId],
      });

      // Invalidate events list
      queryClient.invalidateQueries({
        queryKey: ["events"],
      });

      // Invalidate user events
      queryClient.invalidateQueries({
        queryKey: ["userEvents"],
      });
    },
  });
}
