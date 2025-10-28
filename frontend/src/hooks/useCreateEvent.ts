import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateEventRequest, CreateEventResponse } from "@/types/api";

/**
 * Create a new event on the blockchain
 */
const createEvent = async (
  data: CreateEventRequest
): Promise<CreateEventResponse> => {
  return api.post<CreateEventResponse>("/event/create", data);
};

/**
 * Hook to create a new event
 *
 * @returns Mutation result with createEvent function
 *
 * @example
 * ```tsx
 * const { mutate: createEvent, isPending, isError } = useCreateEvent();
 *
 * const handleCreate = () => {
 *   createEvent({
 *     brandAddress: "0x123...",
 *     eventName: "My Event",
 *     quota: 100,
 *     description: "Event description",
 *     image: "https://example.com/image.jpg",
 *     lat: -6.2146,
 *     long: 106.8451,
 *     radius: 500,
 *     startDate: "2025-12-01T10:00:00Z",
 *     endDate: "2025-12-01T18:00:00Z",
 *     totalRareNFT: 10,
 *   }, {
 *     onSuccess: (data) => {
 *       console.log("Event created:", data);
 *     },
 *     onError: (error) => {
 *       console.error("Failed to create event:", error);
 *     }
 *   });
 * };
 * ```
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidate events list to refetch after creating
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
