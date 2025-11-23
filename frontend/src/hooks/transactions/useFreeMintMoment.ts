import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface FreeMintMomentParams {
  recipient: string;
  name: string;
  description?: string;
  thumbnail: File;
}

export function useFreeMintMoment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: FreeMintMomentParams) => {
      const formData = new FormData();
      formData.append('recipient', params.recipient);
      formData.append('name', params.name);
      if (params.description) formData.append('description', params.description);
      formData.append('thumbnail', params.thumbnail);

      const response = await api.post(
        `/moment/free`,
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
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error('Minting error:', error);
    },
  });
}
