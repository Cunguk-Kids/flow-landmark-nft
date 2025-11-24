'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import axios from 'axios';
import { type UIEvent } from './useEventList';

// Tipe Data Response dari Backend (Single Item)
interface GetEventDetailResponse {
  data: {
    event_id: number;
    name: string;
    description: string;
    thumbnail: string;
    location: string;
    start_date: string;
    quota: number;
    is_registered: boolean;
    is_checked_in: boolean;
    attendees?: [{
      id: number;
      user_address: string;
    }]
    edges?: {
      host?: {
        address: string;
      };
      attendances?: [{
        id: number;
        user_address: string;
      }]
    };
    // ... field lain
  };
}

const fetchEventById = async (id: string, userAddress?: string) => {
  try {
    // PANGGIL ENDPOINT SPESIFIK
    // Add viewer parameter only if userAddress is provided
    const url = userAddress
      ? `/events/${id}?viewer=${userAddress}`
      : `/events/${id}`;

    const response = await api.get<GetEventDetailResponse>(url);

    const ev = response.data.data;

    // Transform ke UI Model
    return {
      id: ev.event_id,
      title: ev.name,
      description: ev.description,
      image: ev.thumbnail,
      location: ev.location,
      date: ev.start_date,
      organizer: ev.edges?.host?.address || "Unknown",
      attendees: ev.edges?.attendances,
      isRegistered: ev.is_registered,
      isCheckedIn: ev.is_checked_in,
      price: 0,
      quota: ev.quota
    } as UIEvent;

  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Event tidak ditemukan
    }
    throw error;
  }
};

export function useEventDetail(id: string, userAddress?: string) {
  return useQuery({
    queryKey: ['event-detail', id, userAddress],
    queryFn: () => fetchEventById(id, userAddress),
    enabled: !!id, // Only require id, userAddress is optional
    retry: false, // Jangan retry kalau 404
  });
}