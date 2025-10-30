/**
 * Hook for fetching paginated list of partners/brands
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PartnersListResponse } from "@/types/api";

interface UsePartnerListParams {
  page?: number;
  limit?: number;
}

export function usePartnerList(params: UsePartnerListParams = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ["partners", { page, limit }],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      return api.get<PartnersListResponse>(`/partner?${queryParams}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
