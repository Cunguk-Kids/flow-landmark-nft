import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from 'sonner';

interface ToggleLikeParams {
  momentId: number; // Internal ID
  userAddress: string;
}

interface AddCommentParams {
  momentId: number; // Internal ID
  userAddress: string;
  content: string;
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ momentId, userAddress }: ToggleLikeParams) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/moments/${momentId}/like`,
        null,
        { params: { user: userAddress } }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate or Optimistic Update (Simpler to invalidate for now, or we can manually update cache)
      queryClient.invalidateQueries({ queryKey: ["moments-feed"] });
    },
    onError: (error: any) => {
      toast.error('Failed to like moment', {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ momentId, userAddress, content }: AddCommentParams) => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/moments/${momentId}/comments`,
        { userAddress: userAddress, content }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success('Comment posted!');
      queryClient.invalidateQueries({ queryKey: ["moments-feed"] });
      queryClient.invalidateQueries({ queryKey: ["comments", variables.momentId] });
    },
    onError: (error: any) => {
      toast.error('Failed to post comment', {
        description: error.response?.data?.error || error.message
      });
    }
  });
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    address: string;
    nickname?: string;
    pfp?: string;
  };
}

interface GetCommentsResponse {
  data: Comment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export function useGetComments(momentId: number) {
  return useQuery({
    queryKey: ["comments", momentId],
    queryFn: async () => {
      const response = await axios.get<GetCommentsResponse>(
        `${import.meta.env.VITE_BASE_URL}/moments/${momentId}/comments`
      );
      return response.data;
    },
  });
}
