import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface MintMomentDTO {
  recipient: string;
  eventPassID: string; // ID On-Chain (UInt64)
  name: string;
  description: string;
  thumbnail: File;
  tier?: string; // "0" for community, "1" for pro (optional, default 0)
}

export function useMintMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MintMomentDTO) => {
      const formData = new FormData();
      formData.append('recipient', data.recipient);
      formData.append('eventPassID', data.eventPassID);
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('thumbnail', data.thumbnail);
      if (data.tier) {
        formData.append('tier', data.tier);
      }

      const response = await api.post(
        `/moment/with-event-pass`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      queryClient.invalidateQueries({ queryKey: ['event-passes'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
