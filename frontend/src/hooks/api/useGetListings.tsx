'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';

// --- Tipe Data (DTO) ---
export interface ListingData {
  id: number;
  listing_id: number; // ID Resource Listing Flow
  price: number;
  payment_vault_type: string;
  nft_type_id: string;
  expiry: string;
  edges?: {
    seller?: {
      address: string;
    };
    nft_accessory?: {
      name: string;
      thumbnail: string;
      nft_id: number;
    };
    nft_moment?: {
      name: string;
      thumbnail: string;
      nft_id: number;
    };
  };
}

interface GetListingsResponse {
  data: ListingData[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// --- Fetcher ---
const fetchListings = async (page: number, pageSize: number) => {
  const response = await axios.get<GetListingsResponse>(`${import.meta.env.VITE_BASE_URL}/listings`, {
    params: {
      page,
      pageSize,
      // Nanti bisa tambah filter lain: sort_by=price, dll.
    },
  });
  return response.data;
};

// --- Hook ---
export function useGetListings(page: number = 1, pageSize: number = 12) {
  return useQuery({
    queryKey: ['listings', page, pageSize],
    queryFn: () => fetchListings(page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 Menit
  });
}