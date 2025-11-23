import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Moment {
  id: number;
  nft_id: number;
  name: string;
  description: string;
  thumbnail: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  edges: {
    owner: {
      address: string;
      nickname?: string;
      pfp?: string;
    };
    equipped_accessories?: Array<{
      id: number;
      name: string;
      thumbnail: string;
      equipment_type: string;
    }>;
    minted_with_pass?: {
      id: number;
      name: string;
      event: {
        name: string;
      };
    };
  };
}

interface GetMomentsResponse {
  data: Moment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const fetchMoments = async ({ pageParam = 1, viewer }: { pageParam?: number; viewer?: string }) => {
  const response = await api.get<GetMomentsResponse>(
    `/moments`,
    {
      params: {
        page: pageParam,
        pageSize: 10,
        viewer: viewer, // Send viewer address
      },
    }
  );
  return response.data;
};

export function useGetMoments(viewerAddress?: string) {
  return useInfiniteQuery({
    queryKey: ["moments-feed", viewerAddress],
    queryFn: ({ pageParam }) => fetchMoments({ pageParam, viewer: viewerAddress }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}
