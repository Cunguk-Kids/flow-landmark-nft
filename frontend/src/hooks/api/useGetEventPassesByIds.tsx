'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// Tipe Data Pass
interface EventPassData {
  id: number;
  pass_id: number;
  thumbnail: string; // Asumsi backend kirim thumbnail flat atau nested di edges.event.thumbnail
  name: string;
  edges?: {
    event?: {
      name: string;
      thumbnail: string;
    }
  }
}

interface PassesResponse {
  data: EventPassData[];
}

const fetchPassesByIds = async (ids: number[]) => {
  if (ids.length === 0) return [];

  const promises = ids.map(id =>
    api.get<PassesResponse>(`/event-passes/${id}`, {
      params: { pageSize: 1 }
    }).then(res => {
      return res.data.data
    })
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean);
};

export function useGetEventPassesByIds(ids: number[] | undefined) {
  return useQuery({
    queryKey: ['event-passes-bulk', ids],
    queryFn: () => fetchPassesByIds(ids || []),
    enabled: !!ids && ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}