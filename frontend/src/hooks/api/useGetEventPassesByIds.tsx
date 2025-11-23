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

  // Kita kirim request dengan multiple ID
  // Backend harus support ?pass_id_in=1,2,3 atau similar
  // Atau kita panggil Promise.all jika backend belum support bulk fetch (sementara)

  // OPSI 1: Backend Support Bulk (Ideal)
  /*
  const response = await api.get<PassesResponse>(`/event-passes`, {
    params: {
      pass_ids: ids.join(','), 
      pageSize: ids.length
    }
  });
  return response.data.data;
  */

  // OPSI 2: Fetch Parallel (Jika backend belum support bulk filter)
  const promises = ids.map(id =>
    api.get<PassesResponse>(`/event-passes`, {
      params: { pass_id: id, pageSize: 1 }
    }).then(res => res.data.data[0])
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean); // Hapus yang null/undefined
};

export function useGetEventPassesByIds(ids: number[] | undefined) {
  return useQuery({
    queryKey: ['event-passes-bulk', ids],
    queryFn: () => fetchPassesByIds(ids || []),
    enabled: !!ids && ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}