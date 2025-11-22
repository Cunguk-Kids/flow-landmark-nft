'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';

// Tipe Data User (DTO dari Backend)
export interface UserDTO {
  id: number;
  address: string;
  nickname?: string;
  bio?: string;
  pfp?: string;
  short_description?: string;
  bg_image?: string;
  highlighted_moment_id?: string;
  socials?: {}
}

interface UsersResponse {
  data: UserDTO[];
  pagination: any;
}

const fetchUsers = async (query: string) => {
  // LOGIKA PINDAH ENDPOINT
  // Jika query kosong, ambil list default (/users)
  // Jika query ada, ambil search (/users/search)
  const endpoint = query.trim() === '' ? '/users' : '/users/search';
  
  const response = await axios.get<UsersResponse>(`${import.meta.env.VITE_BASE_URL}${endpoint}`, {
    params: {
      q: query || undefined, // Kirim 'q' hanya jika ada
      page: 1,
      pageSize: 12,
    },
  });
  return response.data.data;
};

export function useUserSearch(searchTerm: string) {
  // 1. Debounce input user selama 500ms
  const debouncedSearch = useDebounce(searchTerm, 500);

  return useQuery({
    // Query Key berubah saat debounced value berubah
    queryKey: ['user-search', debouncedSearch],
    
    queryFn: () => fetchUsers(debouncedSearch),
    
    // Selalu aktif (karena kita mau load awal juga)
    // staleTime pendek agar terasa responsif
    staleTime: 1000 * 60, 
    placeholderData: (previousData) => previousData, // UX: Jangan kedip jadi loading saat ngetik, tahan data lama
  });
}