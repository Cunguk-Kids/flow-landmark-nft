'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUpdateProfile, type UpdateProfileDTO } from '@/hooks/transactions/useUpdateProfile';
import { useGetMomentsPaginated } from '@/hooks/api/useGetNFTMoment';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import MomentCard from '@/components/MomentCard';

// Interface Data (Sama seperti sebelumnya)
interface UserProfileData {
  nickname?: string;
  bio?: string;
  shortDescription?: string;
  pfp?: string;
  bgImage?: string;
  socials?: Record<string, string>;
  highlighted_moment_id?: number; 
}

interface HighlightMomentModalProps {
  currentProfile: UserProfileData | null;
  onSuccess: () => void;
}

export default function HighlightMomentModal({ currentProfile, onSuccess }: HighlightMomentModalProps) {
  const { user } = useFlowCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  
  // --- 1. DATA ---
  // Ambil momen user untuk LIST di dalam Modal
  const { data: myMomentsData, isLoading: isLoadingMoments } = useGetMomentsPaginated(user?.addr);
  const myMoments = myMomentsData?.data || [];
  console.log(myMoments, myMomentsData)

  // Ambil data Featured Moment saat ini untuk PREVIEW di Trigger
  // (Idealnya kita punya MomentCard yang bisa fetch by ID, atau kita cari dari myMoments)
  const featuredMoment = myMoments.find(m => Number(m.nft_id) === Number(currentProfile?.highlighted_moment_id));

  const { updateProfile, isPending, isSealed } = useUpdateProfile();

  // --- 2. EFEK ---
  useEffect(() => {
    if (isSealed) {
      onSuccess();
      setIsOpen(false);
    }
  }, [isSealed, onSuccess]);

  // --- 3. HANDLER ---
  const handleSelectMoment = (momentID: number | null) => {
    if (!currentProfile) return;

    const payload: UpdateProfileDTO = {
      nickname: currentProfile.nickname,
      bio: currentProfile.bio,
      shortDescription: currentProfile.shortDescription,
      pfp: currentProfile.pfp,
      bgImage: currentProfile.bgImage,
      socials: currentProfile.socials || {},
      momentID: momentID // Update ID
    };

    updateProfile(payload);
  };

  return (
    <>
      {/* =============================================
          TRIGGER UI (KOTAK FEATURED MOMENT)
          =============================================
      */}
      <div 
        onClick={() => setIsOpen(true)} 
        className="bg-rpn-card border border-rpn-blue/30 rounded-2xl p-6 shadow-lg cursor-pointer group hover:border-rpn-blue/60 transition-all"
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 className="text-lg font-bold text-white uppercase font-pixel text-sm tracking-widest">
                Featured Moment
            </h3>
            <span className="text-[10px] text-rpn-blue bg-rpn-blue/10 px-2 py-1 rounded font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                CLICK TO CHANGE
            </span>
        </div>

        <div className="aspect-video bg-rpn-dark/50 rounded-xl border-2 border-dashed border-rpn-blue/20 flex flex-col items-center justify-center text-rpn-muted hover:border-rpn-blue hover:bg-rpn-dark/80 transition-all overflow-hidden relative">
            
            {currentProfile?.highlighted_moment_id ? (
                // Tampilan Jika Ada Featured (Preview)
                <div className="w-full h-full pointer-events-none">
                   {/* Jika data featuredMoment sudah ter-load, tampilkan gambarnya */}
                   {featuredMoment ? (
                       <img 
                         src={featuredMoment.thumbnail} // Pastikan helper IPFS
                         alt="Featured" 
                         className="w-full h-full object-cover"
                         style={{ imageRendering: 'pixelated' }}
                       />
                   ) : (
                       // Fallback jika data belum load tapi ID ada
                       <div className="flex items-center justify-center h-full">
                           <Loader2 className="animate-spin text-rpn-blue" />
                       </div>
                   )}
                   
                   {/* Overlay ID */}
                   <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-mono">
                      #{currentProfile.highlighted_moment_id}
                   </div>
                </div>
            ) : (
                // Tampilan Kosong
                <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform">
                    <span className="text-4xl opacity-30 grayscale group-hover:grayscale-0 transition-all">🖼️</span>
                    <p className="text-xs uppercase font-bold text-rpn-muted group-hover:text-rpn-blue">Select a Moment</p>
                </div>
            )}
        </div>
      </div>

      {/* =============================================
          MODAL CONTENT
          =============================================
      */}
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={!isPending}>
        <DialogContent className="bg-rpn-dark border-2 border-rpn-blue text-rpn-text sm:max-w-[800px] rounded-xl shadow-[8px_8px_0px_0px_rgba(41,171,226,0.3)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-rpn-blue uppercase font-pixel mb-4">
              Select Featured Moment
            </DialogTitle>
          </DialogHeader>

          <div className="h-[400px] overflow-y-auto p-2 custom-scrollbar">
              
              {/* Loading */}
              {isLoadingMoments && (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-rpn-blue" /></div>
              )}

              {/* Empty State */}
              {!isLoadingMoments && myMoments.length === 0 && (
                  <div className="text-center py-20 text-rpn-muted">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="font-mono text-sm">No moments found.</p>
                      <p className="text-xs mt-2">Mint a moment first to feature it!</p>
                  </div>
              )}

              {/* Grid Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Opsi 1: Remove Highlight */}
                  <button
                      onClick={() => handleSelectMoment(null)}
                      disabled={isPending}
                      className="aspect-square border-2 border-dashed border-red-500/30 hover:border-red-500 rounded-xl flex flex-col items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors gap-2 group"
                  >
                      {isPending ? <Loader2 className="animate-spin"/> : <Trash2 />}
                      <span className="text-[10px] font-bold uppercase">Remove Featured</span>
                  </button>

                  {/* Opsi 2: Daftar Momen */}
                  {myMoments.map((moment) => (
                      <div 
                          key={moment.nft_id} 
                          className="relative group cursor-pointer" 
                          onClick={() => handleSelectMoment(Number(moment.nft_id))}
                      >
                          {/* Card Preview (Sederhana) */}
                          <div className={`pointer-events-none transition-opacity ${isPending ? 'opacity-50' : ''}`}>
                               <div className="bg-rpn-card p-2 rounded-lg text-center border border-rpn-blue/20">
                                  <div className="w-full aspect-square bg-rpn-dark border border-rpn-blue/30 mb-2 rounded overflow-hidden">
                                      <img src={moment.thumbnail} alt={moment.name} className="w-full h-full object-cover" style={{imageRendering:'pixelated'}} />
                                  </div>
                                  <p className="text-[10px] text-rpn-blue truncate font-bold">{moment.name}</p>
                               </div>
                          </div>
                          
                          {/* Overlay Selection / Loading */}
                          <div className={`absolute inset-0 border-4 rounded-xl flex items-center justify-center transition-all ${Number(currentProfile?.highlighted_moment_id) === Number(moment.nft_id) ? 'border-rpn-blue bg-rpn-blue/20' : 'border-transparent group-hover:border-rpn-blue/50'}`}>
                              {isPending && Number(currentProfile?.highlighted_moment_id) !== Number(moment.nft_id) && (
                                  <Loader2 className="animate-spin text-rpn-blue" />
                              )}
                               {Number(currentProfile?.highlighted_moment_id) === Number(moment.nft_id) && !isPending && (
                                  <span className="bg-rpn-blue text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">CURRENT</span>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}