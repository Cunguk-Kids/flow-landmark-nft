import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EventDetailResponse } from "@/types/api";
import { USE_MOCK_DATA, getMockEventDetail, simulateDelay } from "@/lib/mockData";

/**
 * Fetch single event detail by ID (or mock data if enabled)
 */
const fetchEventDetail = async (id: number): Promise<EventDetailResponse> => {
  // USE MOCK DATA - Comment out this block when API is fixed
  if (USE_MOCK_DATA) {
    await simulateDelay(300); // Simulate network delay
    const event = getMockEventDetail(id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return event;
  }

  // REAL API - Uncomment when API is working
  return api.get<EventDetailResponse>(`/event/${id}`);
};

/**
 * Hook to fetch event detail by ID
 *
 * @param id - Event ID
 * @returns Query result with event detail data
 *
 * @example
 * ```tsx
 * const { data: event, isLoading, error } = useEventDetail(123);
 * ```
 */
export function useEventDetail(id: number) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventDetail(id),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Direct fetch function (useful for server-side or loader functions)
 */
useEventDetail.fetch = fetchEventDetail;
