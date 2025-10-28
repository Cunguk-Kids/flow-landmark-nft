import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EventsListResponse, EventsQueryParams } from "@/types/api";

/**
 * Fetch events list from API
 */
const fetchEvents = async (
  params: EventsQueryParams = {}
): Promise<EventsListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());
  if (params.brandAddress) queryParams.set("brandAddress", params.brandAddress);
  if (params.status !== undefined)
    queryParams.set("status", params.status.toString());

  const queryString = queryParams.toString();
  const endpoint = `/event/${queryString ? `?${queryString}` : ""}`;

  return api.get<EventsListResponse>(endpoint);
};

/**
 * Hook to fetch events list with pagination and filters
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Query result with events data and pagination metadata
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useEventList({ page: 1, limit: 10 });
 * ```
 */
export function useEventList(params: EventsQueryParams = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

/**
 * Direct fetch function (useful for server-side or loader functions)
 */
useEventList.fetch = fetchEvents;
