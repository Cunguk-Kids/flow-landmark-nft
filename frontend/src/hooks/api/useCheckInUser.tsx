'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useFlowCurrentUser } from '@onflow/react-sdk';

// Payload yang dikirim ke Backend
interface CheckInPayload {
  userAddress: string;
  eventID: string; // Dikirim sebagai string ke backend
}

// Response dari Backend
interface CheckInResponse {
  data: {
    message: string;
    userAddress: string;
    eventID: string;
  };
}

export function useCheckInUser() {
  const queryClient = useQueryClient();
  const { user } = useFlowCurrentUser();

  return useMutation({
    mutationFn: async (eventID: string | number) => {

      // Validasi User Login
      if (!user?.addr) {
        throw new Error("Harap hubungkan dompet (wallet) Anda terlebih dahulu.");
      }

      const payload: CheckInPayload = {
        userAddress: user.addr,
        eventID: String(eventID), // Pastikan dikirim sebagai string
      };

      // Panggil API Backend Go
      const response = await api.post<CheckInResponse>(
        `/event/check-in`,
        payload
      );

      return response.data;
    },

    onSuccess: (_, eventID) => {
      // Refresh data detail event agar status 'isRegistered' / 'attendees' terupdate
      queryClient.invalidateQueries({ queryKey: ['event-detail', String(eventID)] });

      // Refresh data profil user (karena user mungkin dapat EventPass baru)
      if (user?.addr) {
        queryClient.invalidateQueries({ queryKey: ['user-profile', user.addr] });
      }

      console.log("Check-in Berhasil!");
    },

    onError: (error: any) => {
      // Tangkap pesan error dari backend (APIResponse)
      const message = error.response?.data?.error || error.message || "Gagal melakukan check-in.";
      console.error("Check-in Gagal:", message);
      // Anda bisa melempar error ini lagi agar UI bisa menangkapnya
      throw new Error(message);
    }
  });
}