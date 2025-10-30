/**
 * Hook for fetching a single partner's details by address
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PartnerDetailResponse } from "@/types/api";

export function usePartnerDetail(address: string) {
  return useQuery({
    queryKey: ["partner", address],
    queryFn: () => api.get<PartnerDetailResponse>(`/partner/${address}`),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
