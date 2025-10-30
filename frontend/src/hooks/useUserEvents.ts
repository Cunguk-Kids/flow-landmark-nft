/**
 * Hook for fetching events filtered by user participation status
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EventsListResponse, UserEventQueryParams } from "@/types/api";

export function useUserEvents(params: UserEventQueryParams) {
  const { userAddress, page = 1, limit = 10, status } = params;

  return useQuery({
    queryKey: ["userEvents", { userAddress, page, limit, status }],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        userAddress,
        page: String(page),
        limit: String(limit),
      });

      if (status) {
        queryParams.append("status", status);
      }

      return api.get<EventsListResponse>(`/event/user?${queryParams}`);
    },
    enabled: !!userAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes (user data changes more frequently)
  });
}
