'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { type MomentData } from '@/components/MomentCard';

// Response wrapper sesuai standar API kita
interface SingleMomentResponse {
  data: MomentData[]; // API list biasanya return array, kita ambil index 0
}

const fetchMomentById = async (nftId: number) => {
  // Kita gunakan endpoint moments dengan filter nft_id
  // Pastikan Backend Go Anda mendukung ?nft_id=... atau buat endpoint /moments/:id
  const response = await api.get<SingleMomentResponse>(`/moments`, {
    params: {
      nft_id: nftId, // Filter spesifik
      page: 1,
      pageSize: 1,
    },
  });

  return response.data.data[0] || null;
};

export function useGetMomentById(nftId: number | undefined | null, options?: { staleTime?: number }) {
  return useQuery({
    queryKey: ['moment-detail', nftId],
    queryFn: () => fetchMomentById(nftId!),
    enabled: !!nftId, // Hanya jalan jika ID ada
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // Cache 5 menit
  });
}