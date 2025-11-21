'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// --- 1. Tipe Data dari Backend (Raw Response) ---
// Sesuaikan dengan JSON yang dikirim oleh Backend Go
export interface BackendEvent {
  id: number;
  event_id: number;
  name: string;
  description: string;
  thumbnail: string;
  location: string;
  start_date: string; // ISO String dari Go
  end_date: string;
  quota: number;
  edges?: {
    host?: {
      address: string;
    };
  };
}

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface GetEventsResponse {
  data: BackendEvent[];
  pagination: Pagination;
}

// --- 2. Tipe Data untuk UI (Frontend Model) ---
// Ini yang dibutuhkan oleh komponen <EventCard />
export interface UIEvent {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;     // Date string untuk diparsing UI
  organizer: string;
  price: number;    // (Sementara hardcode atau ambil dari logic lain)
  quota: number;
  isRegistered: boolean;
}

// --- 3. Fetcher Function ---
const fetchEvents = async (page = 1) => {
  const response = await axios.get<GetEventsResponse>(`${import.meta.env.VITE_BASE_URL}/events`, {
    params: {
      page: page,
      pageSize: 20, // Ambil 20 event per halaman
      // type: 0, // Opsional: Filter online/offline jika perlu
    },
  });
  return response.data;
};

// --- 4. Hook Utama ---
export function useEventList(page: number = 1) {
  return useQuery({
    queryKey: ['events-list', page],
    queryFn: () => fetchEvents(page),
    staleTime: 1000 * 60 * 2, // Cache selama 2 menit
    
    // --- TRANSFORMASI DATA (PENTING) ---
    // Mengubah format Backend -> Format UI agar komponen tidak error
    select: (response) => {
      const transformedData: UIEvent[] = response.data.map((ev) => ({
        id: ev.event_id, // Gunakan ID on-chain
        title: ev.name,
        description: ev.description,
        image: ev.thumbnail,
        location: ev.location,
        date: ev.start_date,
        organizer: ev.edges?.host?.address || "Unknown Host",
        price: 0, // (Backend belum kirim harga tiket, asumsi gratis/0 untuk MVP)
        quota: ev.quota,
        isRegistered: false,
      }));
      
      return transformedData;
    },
  });
}