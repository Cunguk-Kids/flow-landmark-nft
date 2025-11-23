'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

// --- 1. Definisi Tipe Data (DTO) ---
export interface Accessory {
  id: number;          // ID Database
  nft_id: number;      // ID On-Chain (UInt64)
  name: string;
  description: string;
  thumbnail: string;   // URL IPFS/Gambar
  
  // Jika ada relasi lain dari backend
  edges?: {
    owner?: {
      address: string;
    };
    // Info listing jika sedang dijual
    listing?: {
        id: number;
        price: number;
    };
    equipped_on_moment?: {
        id: number;
        name: string;
    } | null;
  };
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface GetAccessoriesResponse {
  data: Accessory[];
  pagination: Pagination;
}

// --- 2. Fungsi Fetcher ---
const fetchAccessories = async (address: string | null, page: number, pageSize: number) => {
  const params: Record<string, any> = {
    page,
    pageSize,
  };

  // Jika address ada, filter by owner (Inventaris Saya)
  // Jika tidak ada, backend akan mengembalikan semua (Global Marketplace/Explore)
  if (address) {
    params.owner_address = address;
  }

  const response = await axios.get<GetAccessoriesResponse>(`${import.meta.env.VITE_BASE_URL}/accessories`, {
    params,
  });

  return response.data;
};

// --- 3. Hook Utama ---
export function useGetAccessories(address: string | null | undefined, page: number = 1, pageSize: number = 12) {
  return useQuery({
    // Query Key: Unik berdasarkan address dan halaman
    queryKey: ['accessories', address, page, pageSize],
    
    queryFn: () => fetchAccessories(address || null, page, pageSize),
    
    // Konfigurasi
    // enabled: true, // Selalu jalan (bisa untuk public explore atau private inventory)
    staleTime: 1000 * 60 * 1, // 1 Menit
    
    // UX: Pertahankan data lama saat fetching halaman baru (mencegah flickering)
    placeholderData: keepPreviousData, 
  });
}