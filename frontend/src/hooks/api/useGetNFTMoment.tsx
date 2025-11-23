'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/axios';

// --- Interface Data ---
export interface NFTMoment {
  id: number;
  nft_id: number;
  name: string;
  thumbnail: string;
  edges?: {
    equipped_accessories?: any[];
    minted_with_pass?: any;
  };
}

interface GetMomentsResponse {
  data: NFTMoment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// --- Hook Utama (Pagination) ---
export function useGetMomentsPaginated(address: string | null | undefined, page: number = 1) {
  return useQuery({
    // Query Key sekarang menyertakan 'page' agar otomatis refetch saat page berubah
    queryKey: ['moments', address, page],

    queryFn: async () => {
      if (!address) return { data: [], pagination: { totalPages: 0, currentPage: 1, totalItems: 0, pageSize: 12 } };

      const response = await api.get<GetMomentsResponse>(`/moments`, {
        params: {
          owner_address: address,
          page: page,
          pageSize: 9, // Tampilkan 9 item per halaman (3x3 grid)
        },
      });
      return response.data;
    },

    // Logic standar
    enabled: !!address,
    staleTime: 1000 * 60 * 1, // 1 menit

    // UX Magic: Pertahankan data halaman sebelumnya saat loading halaman baru
    placeholderData: keepPreviousData,
  });
}