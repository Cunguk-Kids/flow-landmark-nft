import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

interface UploadResponse {
  url: string;
  message: string;
}

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await api.post<UploadResponse>(
        `/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });
};
