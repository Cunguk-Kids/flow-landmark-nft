'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Import Button
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { useGetMomentsPaginated } from '@/hooks/api/useGetNFTMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';

// Interface (Tetap Sama)
interface UserProfileData {
  nickname?: string;
  bio?: string;
  short_description?: string;
  pfp?: string;
  bg_image?: string;
  socials?: Record<string, string>;
  highlighted_eventPass_ids: number[];
  highlighted_moment_id?: number;
}

interface HighlightMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentProfile: UserProfileData | null;
}

export default function HighlightMomentModal({ isOpen, onClose, onSuccess, currentProfile }: HighlightMomentModalProps) {
  const { user } = useFlowCurrentUser();
  const { data: myMomentsData, isLoading: isLoadingMoments } = useGetMomentsPaginated(user?.addr);
  const myMoments = myMomentsData?.data || [];

  const { updateProfile, isPending, isSealed } = useUpdateProfile();

  // --- 1. STATE LOKAL (SELEKSI SEMENTARA) ---
  // Inisialisasi dengan highlight saat ini (atau null)
  const [selectedID, setSelectedID] = useState<number | null>(null);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen && currentProfile) {
      // Parse ID dari profil (pastikan number)
      const currentId = currentProfile.highlighted_moment_id ? Number(currentProfile.highlighted_moment_id) : null;
      setSelectedID(currentId);
    }
  }, [isOpen, currentProfile]);

  // Auto close saat sukses
  useEffect(() => {
    if (isSealed) {
      onSuccess();
      onClose();
    }
  }, [isSealed]);


  // --- 2. HANDLER ---
  // Hanya update state lokal, belum kirim transaksi
  const handleSelectLocal = (id: number | null) => {
    setSelectedID(id);
  };

  // Tombol SAVE ditekan -> Kirim Transaksi
  const handleSave = () => {
    if (!currentProfile) return;

    // Jika tidak ada perubahan, tutup saja modalnya
    if (selectedID === Number(currentProfile.highlighted_moment_id)) {
      onClose();
      return;
    }

    const payload: UpdateProfileDTO = {
      nickname: currentProfile.nickname,
      bio: currentProfile.bio,
      shortDescription: currentProfile.short_description,
      pfp: currentProfile.pfp,
      bgImage: currentProfile.bg_image,
      socials: currentProfile.socials || {},
      momentID: selectedID,
      highlightedEventPassIds: currentProfile.highlighted_eventPass_ids
    };

    updateProfile(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isPending}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[800px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)] flex flex-col max-h-[90vh]">

        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-black text-rpn-blue uppercase font-pixel mb-2">
            Select Featured Moment
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px]">

          {/* Loading */}
          {isLoadingMoments && (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rpn-blue" /></div>
          )}

          {/* Empty */}
          {!isLoadingMoments && myMoments.length === 0 && (
            <div className="text-center py-20 text-rpn-muted">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
              <p className="font-mono text-sm">No moments found.</p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">

            {/* Opsi 1: Remove Highlight */}
            <button
              onClick={() => handleSelectLocal(null)} // Set state ke null
              disabled={isPending}
              className={`
                        cursor-pointer aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors gap-2 group
                        ${selectedID === null
                  ? 'border-red-500 bg-red-500/20 text-red-500' // Selected State
                  : 'border-red-500/30 text-red-500 hover:border-red-500 hover:bg-red-500/10'} // Unselected
                    `}
            >
              <Trash2 />
              <span className="text-[10px] font-bold uppercase">None / Remove</span>
            </button>

            {/* Opsi 2: Daftar Momen */}
            {myMoments.map((moment) => {
              const isSelected = Number(selectedID) === Number(moment.nft_id);

              return (
                <div
                  key={moment.nft_id}
                  className={`relative group cursor-pointer transition-transform ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
                  onClick={() => handleSelectLocal(Number(moment.nft_id))} // Set state lokal
                >
                  {/* Card Preview */}
                  <div className={`pointer-events-none`}>
                    <div className={`bg-rpn-card p-2 rounded-lg text-center border ${isSelected ? 'border-rpn-blue bg-rpn-blue/10' : 'border-rpn-blue/20'}`}>
                      <div className="w-full aspect-square bg-rpn-dark border border-rpn-blue/30 mb-2 rounded overflow-hidden relative">
                        {/* Base Image */}
                        <img
                          src={moment.thumbnail}
                          alt={moment.name}
                          className="w-full h-full object-cover z-10 absolute inset-0"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {/* Accessories Layer */}
                        {moment.edges?.equipped_accessories?.map((acc: any, idx: number) => (
                          <img
                            key={acc.id}
                            src={acc.thumbnail}
                            className="w-full h-full object-contain z-20 absolute inset-0"
                            style={{ imageRendering: 'pixelated', zIndex: 20 + idx }}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] truncate font-bold ${isSelected ? 'text-white' : 'text-rpn-blue'}`}>{moment.name}</p>
                    </div>
                  </div>

                  {/* Checkmark Badge (Visual Feedback) */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-30 bg-rpn-blue text-black rounded-full p-1 shadow-lg animate-in zoom-in">
                      {/* Icon Checkmark sederhana (atau bisa import Check dari lucide) */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-auto shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="text-rpn-muted hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-rpn-blue text-rpn-dark hover:bg-white font-black font-sans uppercase rounded-lg shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#fff] transition-all px-6"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SAVING...</>
            ) : (
              "SAVE CHANGES"
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}