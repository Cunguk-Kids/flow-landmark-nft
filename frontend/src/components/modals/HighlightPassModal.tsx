'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { Loader2, Ticket, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HighlightPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentProfile: any;
  userPasses: any[]
}

export default function HighlightPassModal({ isOpen, onClose, onSuccess, currentProfile, userPasses }: HighlightPassModalProps) {
   // Page 1, bisa ditambah logic infinite jika perlu
  const myPasses = userPasses || [];

  // 2. State Seleksi (Array of IDs)
  // Inisialisasi dengan ID yang sudah ada di profil
  const [selectedIDs, setSelectedIDs] = useState<number[]>([]);

  const { updateProfile, isPending, isSealed } = useUpdateProfile();

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen && currentProfile) {
      const currentIDs = currentProfile.highlightedEventPassIds || [];
      // Pastikan konversi ke number
      setSelectedIDs(currentIDs.map((id: any) => Number(id)));
    }
  }, [isOpen, currentProfile]);

  // Auto close saat sukses
  useEffect(() => {
    if (isSealed) {
      onSuccess();
      onClose();
    }
  }, [isSealed]);

  // --- LOGIKA SELEKSI (MAX 4) ---
  const handleToggle = (passID: number) => {
    setSelectedIDs((prev) => {
      if (prev.includes(passID)) {
        // Jika sudah ada, hapus (deselect)
        return prev.filter((id) => id !== passID);
      } else {
        // Jika belum ada, cek limit
        if (prev.length >= 4) {
            // Bisa tambahkan toast warning disini: "Max 4 badges!"
            return prev;
        }
        return [...prev, passID];
      }
    });
  };
  // --- SIMPAN ---
  const handleSave = () => {
    if (!currentProfile) return;

    // Merge State: Kirim data profil lama + List ID baru
    const payload: UpdateProfileDTO = {
      nickname: currentProfile.nickname,
      bio: currentProfile.bio,
      shortDescription: currentProfile.short_description,
      pfp: currentProfile.pfp,
      bgImage: currentProfile.bg_image,
      socials: currentProfile.socials || {},
      highlightedEventPassIds: selectedIDs,
      momentID: currentProfile.highlighted_moment_id
    };
    
    updateProfile(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={!isPending}>
      <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[700px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)]">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-black text-rpn-blue uppercase font-pixel flex justify-between items-center">
            <span>Select Badges</span>
            <span className={`text-xs font-mono px-3 py-1 rounded ${selectedIDs.length === 4 ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-rpn-card text-white'} border`}>
                {selectedIDs.length} / 4 Selected
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="h-[400px] overflow-y-auto p-2 custom-scrollbar">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {myPasses.map((pass) => {
                    const isSelected = selectedIDs.includes(Number(pass.pass_id));
                    const isMaxed = selectedIDs.length >= 4;
                    const isDisabled = !isSelected && isMaxed; // Disable item lain jika sudah pilih 4
                    console.log(pass)
                    return (
                        <div 
                            key={pass.pass_id}
                            onClick={() => !isDisabled && handleToggle(Number(pass.pass_id))}
                            className={`
                                relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                                ${isSelected 
                                    ? 'border-rpn-blue bg-rpn-blue/10 shadow-[0_0_10px_rgba(41,171,226,0.4)]' 
                                    : isDisabled 
                                        ? 'border-white/5 bg-black/40 opacity-50 cursor-not-allowed grayscale' 
                                        : 'border-white/10 hover:border-white/40 bg-rpn-card'
                                }
                            `}
                        >
                            {/* Gambar Pass */}
                            <div className="aspect-square relative">
                                <img 
                                    src={pass?.thumbnail} 
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Overlay Selected */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-rpn-blue/20 flex items-center justify-center">
                                        <div className="bg-rpn-blue text-black rounded-full p-1 shadow-lg">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nama */}
                            <div className="p-2 text-center bg-black/50">
                                <p className="text-[9px] font-bold text-white truncate">
                                    {pass?.name || `Pass #${pass.pass_id}`}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="text-rpn-muted hover:text-white">Cancel</Button>
            <Button 
                onClick={handleSave}
                disabled={isPending}
                className="bg-rpn-blue text-rpn-dark hover:bg-white font-bold font-pixel text-xs shadow-[2px_2px_0px_0px_#fff]"
            >
                {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                SAVE SELECTION
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}