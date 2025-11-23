import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface UploadResponse {
  url: string;
  message: string;
}

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await axios.post<UploadResponse>(
        `${API_BASE_URL}/upload`,
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
