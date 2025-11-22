'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

export interface EventPassData {
  id: number;
  pass_id: number; // ID On-Chain
  is_redeemed: boolean; // Status apakah sudah dipakai minting
  edges?: {
    event?: {
      id: number;
      event_id: number;
      name: string;
      thumbnail: string;
      start_date: string;
    };
  };
}

interface GetEventPassesResponse {
  data: EventPassData[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// --- Hook ---
export function useGetEventPasses(address: string | null | undefined, page: number = 1) {
  return useQuery({
    queryKey: ['event-passes', address, page],
    
    queryFn: async () => {
      if (!address) return { data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 } };

      const response = await axios.get<GetEventPassesResponse>(`${import.meta.env.VITE_BASE_URL}/event-passes`, {
        params: {
          owner_address: address,
          page: page,
          pageSize: 8, // 8 item per halaman (2 baris x 4 kolom)
        },
      });
      return response.data;
    },

    enabled: !!address,
    placeholderData: keepPreviousData, 
  });
}