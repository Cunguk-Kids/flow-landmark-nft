import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// --- 1. Definisi Tipe Data (DTO) ---
// Sesuaikan ini dengan struktur JSON dari Backend Go Anda
export interface UserProfile {
  id: number;
  address: string;
  nickname?: string;
  bio?: string;
  pfp?: string; // URL gambar
  bg_image?: string; // URL gambar background
  short_description?: string;
  socials?: Record<string, string>; // Map string ke string
  highlighted_moment_id?: number;
  highlighted_eventPass_ids?: number[];
  is_free_minted?: boolean;

  // Relasi (Edges) dari 'ent'
  edges?: {
    moments?: any[]; // Anda bisa mendefinisikan tipe Moment lebih detail jika perlu
    accessories?: any[];
    event_passes?: any[];
    hosted_events?: any[];
    listings?: any[];
  };
}

// --- 2. Fungsi Fetcher ---
const fetchUserProfile = async (address: string): Promise<UserProfile | null | undefined> => {
  try {
    // Panggil API Backend Go
    const url = `${import.meta.env.VITE_BASE_URL}/users/${address}`;
    const { data } = await axios.get(url);

    // Backend kita mengembalikan struktur: { data: UserProfile, ... }
    return data.data;

  } catch (error: any) {
    // HANDLING KHUSUS 404:
    // Jika API mengembalikan 404, itu bukan 'error aplikasi', 
    // tapi berarti user belum setup profil. Kita kembalikan 'null'.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    // Jika error lain (500, network error), lempar error agar TanStack bisa menangkapnya
    throw error;
  }
};

// --- 3. Hook Utama ---
export function useUserProfile(address: string | null | undefined, options?: { staleTime?: number; refetchOnMount?: boolean }) {
  return useQuery({
    // Kunci Unik untuk Cache (berdasarkan alamat)
    queryKey: ['user-profile', address],

    // Fungsi yang dijalankan
    queryFn: () => fetchUserProfile(address!),

    // Konfigurasi:
    // 1. enabled: Hanya jalankan query jika 'address' valid (tidak null/undefined)
    enabled: !!address,

    // 2. retry: false. Jika 404, jangan coba lagi (karena emang belum ada)
    retry: false,

    // 3. staleTime: Anggap data 'segar' selama 1 menit (kurangi request ke server)
    staleTime: options?.staleTime ?? 1000 * 60 * 1,

    // 4. refetchOnWindowFocus: false. Jangan refresh otomatis saat ganti tab browser
    refetchOnWindowFocus: options?.refetchOnMount ?? false,
  });
}