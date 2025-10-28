import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CheckInRequest, CheckInResponse } from "@/types/api";

/**
 * Check-in to an event
 */
const checkIn = async (data: CheckInRequest): Promise<CheckInResponse> => {
  return api.post<CheckInResponse>("/event/check-in", data);
};

/**
 * Hook to check-in to an event
 *
 * @returns Mutation result with checkIn function
 *
 * @example
 * ```tsx
 * const { mutate: checkIn, isPending, isError } = useCheckIn();
 *
 * const handleCheckIn = () => {
 *   checkIn({
 *     eventId: "123",
 *     userAddress: "0xabc...",
 *     brandAddress: "0x123...",
 *   }, {
 *     onSuccess: (data) => {
 *       console.log("Check-in successful:", data);
 *     },
 *     onError: (error) => {
 *       console.error("Check-in failed:", error);
 *     }
 *   });
 * };
 * ```
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkIn,
    onSuccess: (_data, variables) => {
      // Invalidate specific event detail to refetch updated check-in count
      queryClient.invalidateQueries({
        queryKey: ["event", parseInt(variables.eventId)],
      });
      // Also invalidate events list
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
