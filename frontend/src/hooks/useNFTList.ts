/**
 * Hook for fetching paginated list of NFTs with optional filters
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NFTsListResponse } from "@/types/api";

interface UseNFTListParams {
  page?: number;
  limit?: number;
  eventId?: string;
  userAddress?: string;
}

export function useNFTList(params: UseNFTListParams = {}) {
  const { page = 1, limit = 10, eventId, userAddress } = params;

  return useQuery({
    queryKey: ["nfts", { page, limit, eventId, userAddress }],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (eventId) {
        queryParams.append("eventId", eventId);
      }
      if (userAddress) {
        queryParams.append("userAddress", userAddress);
      }

      return api.get<NFTsListResponse>(`/nft?${queryParams}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
